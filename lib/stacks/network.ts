import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { readFileSync } from 'fs';

export class NetworkStack extends cdk.Stack {
  public readonly cdkSecurityGroup: ec2.SecurityGroup;
  public readonly vpc_main: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC_CDK', {
      ipAddresses: ec2.IpAddresses.cidr('192.168.0.0/16'),
      maxAzs: 2,
      // natGateways: 0,
      subnetConfiguration: [
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
          
        },
        {
        name: 'Public',
        subnetType: ec2.SubnetType.PUBLIC,
        cidrMask: 24,  
        
      },
      ],
      
    });

    // const privateSubnet1 = vpc.isolatedSubnets[1];
    // const privateSubnet2 = vpc.isolatedSubnets[3];
    // const publicSubnet1 = vpc.publicSubnets[1];
    // const publicSubnet2 = vpc.publicSubnets[3];

    // const privateSubnet1 = new ec2.PrivateSubnet(this, 'MyPrivateSubnet1', {
    //   availabilityZone: vpc.availabilityZones[0],
    //   cidrBlock: '192.168.1.0/24',
    //   vpcId: vpc.vpcId,
    //   assignIpv6AddressOnCreation: false,
    //   mapPublicIpOnLaunch: false,
    // });
    // const privateSubnet2 = new ec2.PrivateSubnet(this, 'MyPrivateSubnet2', {
    //   availabilityZone: vpc.availabilityZones[1],
    //   cidrBlock: '192.168.2.0/24',
    //   vpcId: vpc.vpcId,
    //   assignIpv6AddressOnCreation: false,
    //   mapPublicIpOnLaunch: false,
    // });

    // const publicSubnet1 = new ec2.PublicSubnet(this, 'MyPublicSubnet1', {
    //   availabilityZone: vpc.availabilityZones[0],
    //   cidrBlock: '192.168.3.0/24',
    //   vpcId: vpc.vpcId,
    //   assignIpv6AddressOnCreation: false,
    //   mapPublicIpOnLaunch: false,
    
    // });

    // const publicSubnet2 = new ec2.PublicSubnet(this, 'MyPublicSubnet2', {
    //   availabilityZone: vpc.availabilityZones[1],
    //   cidrBlock: '192.168.4.0/24',
    //   vpcId: vpc.vpcId,
    //   assignIpv6AddressOnCreation: false,
    //   mapPublicIpOnLaunch: false,
    // });

    // const internetGateway = new ec2.CfnInternetGateway(this, 'InternetGateway');
    // new ec2.CfnVPCGatewayAttachment(this, 'VPCGatewayAttachment', {
    //   vpcId: vpc.vpcId,
    //   internetGatewayId: internetGateway.ref,
    // });

    // // Creating Elastic IPs
    // const eip1 = new ec2.CfnEIP(this, 'ElasticIP1');
    // const eip2 = new ec2.CfnEIP(this, 'ElasticIP2');

    // // Creating NAT Gateways
    // const natGW1 = new ec2.CfnNatGateway(this, 'NatGateway1', {
    //   subnetId: publicSubnet1.subnetId,
    //   allocationId: eip1.attrAllocationId,
    // });

    // const natGW2 = new ec2.CfnNatGateway(this, 'NatGateway2', {
    //   subnetId: publicSubnet2.subnetId,
    //   allocationId: eip2.attrAllocationId,
    // });

    // // Creating route tables for the private subnets
    // const privateRouteTable1 = new ec2.CfnRouteTable(this, 'PrivateRouteTable1', {
    //   vpcId: vpc.vpcId,
    // });

    // const privateRouteTable2 = new ec2.CfnRouteTable(this, 'PrivateRouteTable2', {
    //   vpcId: vpc.vpcId,
    // });

    // const publicRouteTable = new ec2.CfnRouteTable(this, 'PublicRouteTable', {
    //   vpcId: vpc.vpcId,
    // });

    // new ec2.CfnRoute(this, 'IGWRoute1', {
    //   routeTableId: privateRouteTable1.ref,
    //   destinationCidrBlock: '0.0.0.0/0',
    //   gatewayId: internetGateway.ref,
    // });

    // // Add routes to the route tables
    // new ec2.CfnRoute(this, 'NATGWRoute1', {
    //   routeTableId: privateRouteTable1.ref,
    //   destinationCidrBlock: '0.0.0.0/0',
    //   natGatewayId: natGW1.ref,
    // });

    // new ec2.CfnRoute(this, 'NATGWRoute2', {
    //   routeTableId: privateRouteTable2.ref,
    //   destinationCidrBlock: '0.0.0.0/0',
    //   natGatewayId: natGW2.ref,
    // });

    // // Associating route tables with subnets
    // new ec2.CfnSubnetRouteTableAssociation(this, 'PrivateSubnet1RouteAssociation', {
    //   subnetId: privateSubnet1.subnetId,
    //   routeTableId: privateRouteTable1.ref,
    // });

    // new ec2.CfnSubnetRouteTableAssociation(this, 'PrivateSubnet2RouteAssociation', {
    //   subnetId: privateSubnet2.subnetId,
    //   routeTableId: privateRouteTable2.ref,
    // });

    // new ec2.CfnSubnetRouteTableAssociation(this, 'PublicSubnet1RouteAssociation', {
    //   subnetId: publicSubnet1.subnetId,
    //   routeTableId: publicRouteTable.ref,
    // });
    // new ec2.CfnSubnetRouteTableAssociation(this, 'PublicSubnet2RouteAssociation', {
    //   subnetId: publicSubnet2.subnetId,
    //   routeTableId: publicRouteTable.ref,
    // });
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


    new cdk.CfnOutput(this, 'SecurityGroupId', {
      value: cdkSecurityGroup.securityGroupId,
      exportName: 'instances-SGW', // Export name for cross-stack reference
    });

    new cdk.CfnOutput(this, 'vpcID', {
      value: vpc.vpcId,
      exportName: 'vpcID', // Export name for cross-stack reference
    });

    // new cdk.CfnOutput(this, 'isolatedSubnets', {
    //   value: vpc.isolatedSubnets.map(subnet => subnet.subnetId).join(','),
    //   exportName: 'isolatedSubnets', // Export name for cross-stack reference
    // });

    // new cdk.CfnOutput(this, 'publicSubnets', {
    //   value: vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
    //   exportName: 'publicSubnets', // Export name for cross-stack reference
    // });
    
    new cdk.CfnOutput(this, 'AZs', {
      value: vpc.availabilityZones.map(az => az).join(','),
      exportName: 'AZs', // Export name for cross-stack reference
    });
    this.cdkSecurityGroup = cdkSecurityGroup;
    this.vpc_main = vpc;

  }
}
