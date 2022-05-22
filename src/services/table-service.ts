import { Model, ModelFilter } from "react3l-common";
import { SortOrder } from "antd/lib/table/interface";
import { useCallback } from "react";
import { FilterAction, FilterActionEnum } from "./filter-service";

/* services to CRUD, import, export data in table */
export const tableService = {
  /**
   *
   * expose data and event handler for master table service
   * @param: filter: TFilter
   * @param: setFilter: (filter: TFilter) => void
   * @param: handleReloadList: any
   *
   * @return: { handleTableChange, handlePagination }
   *
   * */
  useTable<TFilter extends ModelFilter>(
    filter: TFilter,
    setFilter: (filter: TFilter) => void,
    handleReloadList?: any
  ) {
    const handleTableChange = useCallback(
      (...[, , sorter]) => {
        let newFilter = { ...filter }; // dont check pagination change because of we customize it
        if (
          sorter.field !== filter.orderBy ||
          sorter.order !== getAntOrderType(filter, sorter.field)
        ) {
          newFilter = {
            ...newFilter,
            orderBy: sorter.field,
            orderType: getOrderType(sorter.order),
          };
        } // check sortOrder and sortDirection
        setFilter({ ...newFilter }); // setFilter
        if (typeof handleReloadList === "function") {
          handleReloadList();
        } // handleReloadList
      },
      [filter, setFilter, handleReloadList]
    );

    const handlePagination = useCallback(
      (skip: number, take: number) => {
        setFilter({ ...filter, skip, take });
        if (typeof handleReloadList === "function") {
          handleReloadList();
        }
      },
      [filter, setFilter, handleReloadList]
    );

    return {
      handleTableChange,
      handlePagination,
    };
  },

  useContentTable<T extends Model, TFilter extends ModelFilter>(
    ClassFilter: new () => TFilter,
    ClassContent: new () => T,
    data: T[],
    setData: (t: T[]) => void,
    dispatchFilter: React.Dispatch<FilterAction<TFilter>>,
    handleInvokeChange?: () => void
  ) {
    const handleResetTable = useCallback(() => {
      const newFilter = new ClassFilter();
      dispatchFilter({ type: FilterActionEnum.SET, payload: newFilter });
      if (typeof handleInvokeChange === "function") {
        handleInvokeChange();
      }
    }, [ClassFilter, dispatchFilter, handleInvokeChange]);

    const handlePagination = useCallback(
      (skip: number, take: number) => {
        const newFilter = { ...new ClassFilter(), skip, take };
        dispatchFilter({ type: FilterActionEnum.SET, payload: newFilter });
        if (typeof handleInvokeChange === "function") {
          handleInvokeChange();
        }
      },
      [dispatchFilter, handleInvokeChange, ClassFilter]
    );

    const handleChangeCell = useCallback(
      (key: string, columnKey: keyof T, value?: T[keyof T]) => {
        const rowIdx = data.findIndex((current) => current.key === key);
        if (rowIdx !== -1) {
          data[rowIdx][columnKey] = value;
        }
        setData(data);
        if (typeof handleInvokeChange === "function") {
          handleInvokeChange();
        }
      },
      [data, setData, handleInvokeChange]
    );

    const handleChangeRow = useCallback(
      (key: string, value: T) => {
        const rowIdx = data.findIndex((current) => current.key === key);
        if (rowIdx !== -1) {
          data[rowIdx] = value;
        }
        setData(data);
        if (typeof handleInvokeChange === "function") {
          handleInvokeChange();
        }
      },
      [data, setData, handleInvokeChange]
    );

    const handleAddRow = useCallback(() => {
      data.push(new ClassContent());
      setData(data);
      if (typeof handleInvokeChange === "function") {
        handleInvokeChange();
      }
    }, [ClassContent, data, setData, handleInvokeChange]);

    const handleDeleteRow = useCallback(
      (key: string) => {
        if (data && data.length > 0) {
          const rowIdx = data.findIndex((current) => current.key === key);
          data.splice(rowIdx, 1);
          setData(data);
        }
      },
      [data, setData]
    );

    return {
      handleResetTable,
      handlePagination,
      handleChangeCell,
      handleChangeRow,
      handleAddRow,
      handleDeleteRow,
    };
  },
};

export function getAntOrderType<T extends Model, TFilter extends ModelFilter>(
  tFilter: TFilter,
  columnName: keyof T
): SortOrder {
  if (tFilter.orderBy === columnName) {
    switch (tFilter.orderType) {
      case "ASC":
        return "ascend";

      case "DESC":
        return "descend";

      default:
        return undefined;
    }
  }
  return undefined;
}

export function getOrderType(sortOrder?: SortOrder) {
  switch (sortOrder) {
    case "ascend":
      return "ASC";

    case "descend":
      return "DESC";

    default:
      return undefined;
  }
}
