import { cross, histogram, quantile } from 'd3-array';
import { significant, test } from './mann-whitney';
import { chalkScheme } from './utils';

export interface IStatDisplayOptions {
  control: number[];
  experiment: number[];
  name: string;
}

interface IStatDisplayClass {
  name: string;
  estimator: number;
  // based on alpha of 5%
  significance: string;
  // todo: convert these to output histograms
  controlDistribution: any[];
  experimentDistribution: any[];
  // todo: add locationShift as +/- μs
  // locationShift: number;
  // todo: add observation probability as %
  // probablity: number;
}

export class StatDisplay implements IStatDisplayClass {
  public name: string;
  public significance: string;
  public estimator: number;
  public ustat: number;
  public controlDistribution: any[];
  public experimentDistribution: any[];
  constructor(options: IStatDisplayOptions) {
    const { control, experiment, name } = options;
    this.name = name;
    this.ustat = this.getUSTAT(control, experiment);
    this.significance = this.setIsSignificant(this.ustat, control, experiment);
    this.estimator = this.getHodgesLehmann(control, experiment) as number;
    this.controlDistribution = this.getDistribution(control);
    this.experimentDistribution = this.getDistribution(experiment);
  }
  private getDistribution(a: number[], threshold: number = 7) {
    // todo handle threshold
    return histogram()(a);
  }
  private getUSTAT(control: any[], experiment: any[]): number {
    return Math.min(...test([control, experiment]));
  }
  private getHodgesLehmann(control: any[], experiment: any[]) {
    return quantile(cross(control, experiment, (a, b) => a - b), 0.5);
  }
  private setIsSignificant(
    ustat: number,
    control: any[],
    experiment: any[]
  ): string {
    return significant(ustat, [control, experiment])
      ? chalkScheme.regress('Yes')
      : chalkScheme.neutral('No');
  }
}
