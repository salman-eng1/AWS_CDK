import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';
import { readFileSync } from 'fs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const vpc = new ec2.Vpc(this, 'VPC_CDK', {
      ipAddresses: ec2.IpAddresses.cidr('192.168.0.0/16'),
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ]
    });

    const cdkSecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup_CDK', {
      vpc,
      securityGroupName: "CDK",
      description: 'Allow ssh access to ec2 instances',
      allowAllOutbound: true   // Can be set to false
    });

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow ssh access from anywhere');

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow http traffic from anywhere');

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'allow http traffic from anywhere');

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('192.168.10.10/32'),
      ec2.Port.tcp(3389),
      'allow RDP traffic from anywhere');
    cdk.Tags.of(cdkSecurityGroup).add('Name', 'CDK');

    const rootVolume: ec2.BlockDevice = {
      deviceName: '/dev/xvda',  // device name to attach to the instance
      volume: ec2.BlockDeviceVolume.ebs(15),  // 15 GiB volume size
    };

    const instance = new ec2.Instance(this, 'Instance_CDK', {
      instanceName: 'instance_cdk',
      blockDevices: [rootVolume],
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinux2023ImageSsmParameter({
        kernel: ec2.AmazonLinux2023Kernel.KERNEL_6_1,
      }),
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'ExistingKeyPair', 'cdk_ssh') ,
      availabilityZone: vpc.availabilityZones[0],
      securityGroup: cdkSecurityGroup
    });

    const userDataScript= readFileSync('./lib/user-data.sh', 'utf-8')
    instance.addUserData(userDataScript)

    cdk.Tags.of(instance).add('Name', 'CDK');

  }
}