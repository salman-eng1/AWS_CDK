import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';

import { Construct } from 'constructs';
import { readFileSync } from 'fs';

export class InstanceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // Import subnet IDs from CloudFormation exports

    // const isolatedSubnetsCsv = cdk.Fn.importValue('isolatedSubnets');
    // const isolatedSubnetIds = isolatedSubnetsCsv.split(',');

    // const publicSubnetsCsv = cdk.Fn.importValue('publicSubnets');
    // const publicSubnetIds = publicSubnetsCsv.split(',');

    // const azsCsv = cdk.Fn.importValue('AZs');
    // const azs = azsCsv.split(',');

    // Import VPC with subnets
    // const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVpc', {
    //   vpcId: vpcId,
    //   availabilityZones: azs,
    //   isolatedSubnetIds: isolatedSubnetIds,
    //   publicSubnetIds: publicSubnetIds,
    // });

   const vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', {
      vpcId: 'vpc-059c4615ec1768974',
    });

    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'instancesSGW', 'sg-0b381057abfb5d064');

    // Block Device Configuration
    const rootVolume: ec2.BlockDevice = {
      deviceName: '/dev/xvda',
      volume: ec2.BlockDeviceVolume.ebs(15),
    };

    // User Data Scripts
    const userDataScript1 = readFileSync('./lib/scripts/user-data1.sh', 'utf-8');
    const userDataScript2 = readFileSync('./lib/scripts/user-data2.sh', 'utf-8');

    // Create EC2 Instances
    const instance1 = new ec2.Instance(this, 'Instance1_CDK', {
      instanceName: 'instance1_cdk',
      blockDevices: [rootVolume],
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinux2023ImageSsmParameter({
        kernel: ec2.AmazonLinux2023Kernel.KERNEL_6_1,
      }),
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'ExistingKeyPair1', 'cdk_ssh'),
      vpcSubnets: { 
        subnets: vpc.isolatedSubnets,
      },
      securityGroup: securityGroup,
      userData: ec2.UserData.custom(userDataScript1),
    });

    const instance2 = new ec2.Instance(this, 'Instance2_CDK', {
      instanceName: 'instance2_cdk',
      blockDevices: [rootVolume],
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinux2023ImageSsmParameter({
        kernel: ec2.AmazonLinux2023Kernel.KERNEL_6_1,
      }),
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'ExistingKeyPair2', 'cdk_ssh'),
      vpcSubnets: { 
        subnets: vpc.isolatedSubnets,
      },
      securityGroup: securityGroup,
      userData: ec2.UserData.custom(userDataScript2),
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      vpcSubnets:{
        availabilityZones: vpc.availabilityZones,
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: securityGroup
    });

    // Create Target Group
    const instanceTargetGroup = new elbv2.ApplicationTargetGroup(this, 'InstanceTargetGroup', {
      vpc: vpc,
      port: 80,
      // protocol: elbv2.ApplicationProtocol.HTTP,
      targetGroupName: 'instanceTargetGroup',
      targetType: elbv2.TargetType.INSTANCE,
      healthCheck: {
        path: '/',
        port: '80',
        protocol: elbv2.Protocol.HTTP
      }
    });

    // Add EC2 instances as targets using InstanceTarget
    instanceTargetGroup.addTarget(new InstanceTarget(instance1));
    instanceTargetGroup.addTarget(new InstanceTarget(instance2));

    // Create Listener for the ALB
    const listener = alb.addListener('Listener', {
      port: 80,
    });

    // Add Target Group to Listener
    listener.addTargetGroups('TargetGroup1', {
      targetGroups: [instanceTargetGroup],
    });

    // Tags for EC2 Instances
    cdk.Tags.of(instance1).add('Name', 'CDK_pr1');
    cdk.Tags.of(instance2).add('Name', 'CDK_pr2');
  }
}
