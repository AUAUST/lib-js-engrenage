export interface DescribedResolver<Resolver> {
  readonly resolve: Resolver;
  readonly description: string;
}
