import * as cdk from '@aws-cdk/core';
import * as apprunner from '@aws-cdk/aws-apprunner'
import * as ecr from '@aws-cdk/aws-ecr'

interface AppRunnerProps extends cdk.StackProps {
  ecrAppRepo: ecr.Repository
}

export class AppRunnerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: AppRunnerProps) {
    super(scope, id, props);
    const appName = scope.node.tryGetContext('appName')

    new apprunner.Service(this, 'Service', {
      serviceName: `${appName}-apprunner`,
      source: apprunner.Source.fromEcr({
        imageConfiguration: { port: 80 },
        repository: props.ecrAppRepo,
      }),
    })
  }
}
