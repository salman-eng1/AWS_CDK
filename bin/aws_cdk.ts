#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkStack } from '../lib/aws_cdk-stack';
import { InstanceStack } from '../lib/stacks/instance';
import { NetworkStack } from '../lib/stacks/network';

const app = new cdk.App();

new AwsCdkStack(app, 'AwsCdkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});



new NetworkStack(app, 'NetworkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

})

new InstanceStack(app, 'InstanceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

})