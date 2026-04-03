
  // 目前还存在些问题，如刷新后再次删除时，匹配不上，会多一些type，opaque类似的键，需要后续排查
  // 删除特定滤镜效果
  removeSpecificFilters = (activeObject: fabric.Image, filterIdentifiers: string[], filtersMapData: {}): void => {
    // 当activeObject?.filtersMap数据为空时，采用filtersMapData的数据

    const filtersMap = Object.keys(activeObject?.filtersMap || {}).length === 0 ? filtersMapData : activeObject.filtersMap;

    if (!filtersMap) {
      ConsoleUtil.log("No filters have been applied to this object.");
      return;
    }
    filterIdentifiers.forEach(filterIdentifier => {
      if (filtersMap[filterIdentifier]) {
        const filterList = Array.isArray(filtersMap[filterIdentifier])
          ? filtersMap[filterIdentifier]
          : [filtersMap[filterIdentifier]];

        activeObject.filters = activeObject.filters.filter(
          filter => !filterList.some(filterItem => this.isEqualFilterIgnoringType(filter, filterItem))
        );

        delete filtersMap[filterIdentifier];
      }
    });

    activeObject.applyFilters();
    this.canvas?.renderAll();
  };
