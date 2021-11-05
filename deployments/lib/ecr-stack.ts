import * as cdk from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr';

export class EcrStack extends cdk.Stack {
    public readonly appRepo: ecr.Repository;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
      const appName = this.node.tryGetContext('appName');

      this.appRepo = new ecr.Repository(this, 'AppEcr', {
        imageScanOnPush: true,
        repositoryName: `${appName}-ecr`,
      })
    }
}
