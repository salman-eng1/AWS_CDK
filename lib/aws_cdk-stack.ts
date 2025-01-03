import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC_CDK', {
      ipAddresses: ec2.IpAddresses.cidr('192.168.0.0/16'),
      maxAzs: 2,
      natGateways: 0, // Don't automatically create NAT Gateways
      subnetConfiguration: [
        {
          name: 'Private1',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
        {
          name: 'Private2',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
        {
          name: 'Public1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,  
        },
        {
        name: 'Public2',
        subnetType: ec2.SubnetType.PUBLIC,
        cidrMask: 24,  
      },
      ]
    });

    // Getting references to the private subnets
    const privateSubnet1 = vpc.isolatedSubnets[0];
    const privateSubnet2 = vpc.isolatedSubnets[1];
    const publicSubnet1 = vpc.publicSubnets[0];
    const publicSubnet2 = vpc.publicSubnets[1];

    // Creating Elastic IPs
    const eip1 = new ec2.CfnEIP(this, 'ElasticIP1');
    const eip2 = new ec2.CfnEIP(this, 'ElasticIP2');

    // Creating NAT Gateways
    const natGW1 = new ec2.CfnNatGateway(this, 'NatGateway1', {
      subnetId: publicSubnet1.subnetId,
      allocationId: eip1.attrAllocationId,
    });

    const natGW2 = new ec2.CfnNatGateway(this, 'NatGateway2', {
      subnetId: publicSubnet2.subnetId,
      allocationId: eip2.attrAllocationId,
    });

    // Creating route tables for the private subnets
    const privateRouteTable1 = new ec2.CfnRouteTable(this, 'PrivateRouteTable1', {
      vpcId: vpc.vpcId,
    });

    const privateRouteTable2 = new ec2.CfnRouteTable(this, 'PrivateRouteTable2', {
      vpcId: vpc.vpcId,
    });

    // Add routes to the route tables
    new ec2.CfnRoute(this, 'NATGWRoute1', {
      routeTableId: privateRouteTable1.ref,
      destinationCidrBlock: '0.0.0.0/0',
      natGatewayId: natGW1.ref,
    });

    new ec2.CfnRoute(this, 'NATGWRoute2', {
      routeTableId: privateRouteTable2.ref,
      destinationCidrBlock: '0.0.0.0/0',
      natGatewayId: natGW2.ref,
    });

    // Associating route tables with subnets
    new ec2.CfnSubnetRouteTableAssociation(this, 'PrivateSubnet1RouteAssociation', {
      subnetId: privateSubnet1.subnetId,
      routeTableId: privateRouteTable1.ref,
    });

    new ec2.CfnSubnetRouteTableAssociation(this, 'PrivateSubnet2RouteAssociation', {
      subnetId: privateSubnet2.subnetId,
      routeTableId: privateRouteTable2.ref,
    });

    // Creating a security group
    const cdkSecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup_CDK', {
      vpc,
      securityGroupName: 'CDK',
      description: 'Allow ssh access to ec2 instances',
      allowAllOutbound: true,
    });

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow ssh access from anywhere'
    );

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow http traffic from anywhere'
    );

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'allow https traffic from anywhere'
    );

    cdkSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('192.168.10.10/32'),
      ec2.Port.tcp(3389),
      'allow RDP traffic from anywhere'
    );

    cdk.Tags.of(cdkSecurityGroup).add('Name', 'CDK');

    // Creating EC2 instances with user data
    const rootVolume: ec2.BlockDevice = {
      deviceName: '/dev/xvda',
      volume: ec2.BlockDeviceVolume.ebs(15),
    };

    const userDataScript1 = readFileSync('./lib/scripts/user-data1.sh', 'utf-8');
    const userDataScript2 = readFileSync('./lib/scripts/user-data2.sh', 'utf-8');
    const userDataScript3 = readFileSync('./lib/scripts/user-data3.sh', 'utf-8');



    const instance1 = new ec2.Instance(this, 'Instance1_CDK', {
      instanceName: 'instance1_cdk',
      blockDevices: [rootVolume],
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinux2023ImageSsmParameter({
        kernel: ec2.AmazonLinux2023Kernel.KERNEL_6_1,
      }),
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'ExistingKeyPair1', 'cdk_ssh'),
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      securityGroup: cdkSecurityGroup,
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
      vpcSubnets: { subnets: [privateSubnet1, privateSubnet2] },
      securityGroup: cdkSecurityGroup,
      userData: ec2.UserData.custom(userDataScript2),

    });

    const instance3 = new ec2.Instance(this, 'Instance3_CDK', {
      instanceName: 'instance3_cdk',
      blockDevices: [rootVolume],
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinux2023ImageSsmParameter({
        kernel: ec2.AmazonLinux2023Kernel.KERNEL_6_1,
      }),
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'ExistingKeyPair3', 'cdk_ssh'),
      vpcSubnets: { subnets: [publicSubnet1, publicSubnet2] },
      securityGroup: cdkSecurityGroup,
      userData: ec2.UserData.custom(userDataScript3),

    });


    cdk.Tags.of(instance1).add('Name', 'CDK_pr1');
    cdk.Tags.of(instance2).add('Name', 'CDK_pr2');
    cdk.Tags.of(instance3).add('Name', 'public');

  }
}
