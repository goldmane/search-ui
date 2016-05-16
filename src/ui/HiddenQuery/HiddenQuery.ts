
module Coveo {
  export interface HiddenQueryOptions {
    maximumDescriptionLength: number;
    title: string;
  }

  /**
   * This component job is to handle an "hidden" query parameter.<br/>
   * Concretely, this means that a search interface loaded with #hq=foo&hd=bar will add "foo" as an expression to the query ("hq"=> hidden query) and render "bar" in the {@link Breadcrumb}<br/>
   */
  export class HiddenQuery extends Component {
    static ID = 'HiddenQuery';
    /**
     * Possible options for the HiddenQuery component
     * @componentOptions
     */
    static options: HiddenQueryOptions = {
      /**
       * Specifies a maximum character length for a description.<br/>
       * After this length, the component will slice the descrption and add [...].<br/>
       * Default value is 100
       */
      maximumDescriptionLength: ComponentOptions.buildNumberOption({min: 0, defaultValue: 100}),
      /**
       * Specifies a title that will appear in the {@link Breadcrumb} when it is populated by the HiddenQuery component.<br/>
       * By default, it is a localized string for "Additional filters :"
       */
      title: ComponentOptions.buildLocalizedStringOption({defaultValue: l('AdditionalFilters') + ' : '})
    };

    /**
     * Create a new HiddenQuery component, which bind multiple events (building query as well as {@link Breadcrumb} events
     * @param element
     * @param options
     * @param bindings
     */
    constructor(public element: HTMLElement, public options?: HiddenQueryOptions, bindings?: IComponentBindings) {

      super(element, HiddenQuery.ID, bindings);
      this.options = ComponentOptions.initComponentOptions(element, HiddenQuery, options);

      this.bind.onRootElement(QueryEvents.buildingQuery, (args: IBuildingQueryEventArgs)=> this.handleBuildingQuery(args));
      this.bind.onRootElement(BreadcrumbEvents.populateBreadcrumb, (args: IPopulateBreadcrumbEventArgs)=> this.handlePopulateBreadcrumb(args));
      this.bind.onRootElement(BreadcrumbEvents.clearBreadcrumb, ()=> this.setStateEmpty());
    }

    /**
     * Clear any hd or hq set in the {@link QueryStateModel}, log an analytics event and trigger a new query.
     */
    public clear() {
      this.setStateEmpty();
      var hiddenDescriptionRemoved = this.getDescription();
      this.usageAnalytics.logSearchEvent<IAnalyticsContextRemoveMeta>(AnalyticsActionCauseList.contextRemove, {contextName: hiddenDescriptionRemoved});
      this.queryController.executeQuery();
    }

    private setStateEmpty() {
      this.queryStateModel.set(QueryStateAttributes.HD, '');
      this.queryStateModel.set(QueryStateAttributes.HQ, '');
    }

    private handleBuildingQuery(data: IBuildingQueryEventArgs) {
      Assert.exists(data);
      var hiddenQuery = this.queryStateModel.get(QueryStateAttributes.HQ);
      if (Utils.isNonEmptyString(hiddenQuery)) {
        data.queryBuilder.advancedExpression.add(hiddenQuery);
      }
    }

    private handlePopulateBreadcrumb(args: IPopulateBreadcrumbEventArgs) {
      var description = this.getDescription();
      if (!_.isEmpty(description) && !_.isEmpty(this.queryStateModel.get(QueryStateAttributes.HQ))) {
        var elem = document.createElement('div');
        $$(elem).addClass('coveo-hidden-query-breadcrumb');

        var title = document.createElement('span');
        $$(title).addClass('coveo-hidden-query-breadcrumb-title');
        $$(title).text(this.options.title);
        elem.appendChild(title);

        var values = document.createElement('span');
        $$(values).addClass('coveo-hidden-query-breadcrumb-values');
        elem.appendChild(values);

        var value = document.createElement('span');
        $$(value).addClass('coveo-hidden-query-breadcrumb-value');
        $$(value).text(description);
        values.appendChild(value);

        var clear = document.createElement('span');
        $$(clear).addClass('coveo-hidden-query-breadcrumb-clear');
        elem.appendChild(clear);

        $$(elem).on('click', ()=> this.clear());

        args.breadcrumbs.push({
          element: elem
        })
      }
    }

    private getDescription() {
      var description = this.queryStateModel.get(QueryStateModel.attributesEnum.hd);
      if (_.isEmpty(description)) {
        description = this.queryStateModel.get(QueryStateModel.attributesEnum.hq);
      }
      if (!_.isEmpty(description)) {
        if (description.length > this.options.maximumDescriptionLength) {
          description = description.slice(0, this.options.maximumDescriptionLength) + ' ...';
        }
      }
      return description;
    }
  }
  Initialization.registerAutoCreateComponent(HiddenQuery);
}