import { ACTION_URL_REGEX } from "config/consts";
import { menu, Menu } from "config/menu";
import React, { Reducer, useContext } from "react";
import { forkJoin, Subscription } from "rxjs";
import { utilService } from "./util-service";
import _, { kebabCase } from "lodash";
import { AppStateContext } from "app/AppContext";

export enum AppActionEnum {
  SET,
  UPDATE,
}

export interface AppState {
  permissionPaths?: string[];
  authorizedAction?: string[];
  authorizedMenus?: Menu[];
  authorizedMenuMapper?: Record<string, any>;
}

export interface AppAction {
  type: AppActionEnum;
  payload?: AppState;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case AppActionEnum.SET:
      return {
        ...action.payload,
      };
    case AppActionEnum.UPDATE:
      return {
        ...state,
        ...action.payload,
      };
  }
}

export const authorizationService = {
  useAuthorizedApp() {
    const [
      {
        permissionPaths,
        authorizedMenus,
        authorizedAction,
        authorizedMenuMapper,
      },
      dispatch,
    ] = React.useReducer<Reducer<AppState, AppAction>>(appReducer, {
      permissionPaths: [],
      authorizedMenus: [],
      authorizedAction: [],
      authorizedMenuMapper: null,
    });

    React.useEffect(() => {
      let isCancelled = false;
      if (!isCancelled) {
        dispatch({
          type: AppActionEnum.SET,
          payload: {
            permissionPaths: [],
            authorizedMenus: menu,
            authorizedAction: [],
            authorizedMenuMapper: [],
          },
        });
        const subscription = new Subscription();
        subscription.add(
          forkJoin([
            // Repository to get role
          ]).subscribe({
            next: (results: any[]) => {
              const response = [...results[0], ...results[1]];
              if (response && response.length > 0) {
                const authorizedMenuMapper: Record<string, number> = {};
                const authorizedAction: string[] = [];
                const authorizedMenus: Menu[] = menu.map((item: Menu) => {
                  item.show = item.checkVisible(authorizedMenuMapper);
                  utilService.mapTreeMenu(item.children, authorizedMenuMapper);
                  return item;
                });
                response.forEach((path: string, index: number) => {
                  authorizedMenuMapper[`/${path as string}`] = index;
                  if (path.match(ACTION_URL_REGEX)) authorizedAction.push(path);
                });
                dispatch({
                  type: AppActionEnum.SET,
                  payload: {
                    permissionPaths: [...response],
                    authorizedMenus,
                    authorizedAction,
                    authorizedMenuMapper,
                  },
                });
              } else {
                dispatch({
                  type: AppActionEnum.SET,
                  payload: {
                    permissionPaths: [],
                    authorizedMenus: [],
                    authorizedAction: [],
                    authorizedMenuMapper: [],
                  },
                });
              }
            },
            error: () => {},
          })
        );
        return () => {
          isCancelled = true;
          subscription.unsubscribe();
        };
      }
    }, []);

    return {
      permissionPaths,
      authorizedMenus,
      authorizedMenuMapper,
      authorizedAction,
    };
  },

  useAuthorizedAction(module: string, baseAction: string) {
    const appState = useContext<AppState>(AppStateContext);
    const actionContext = React.useMemo(() => {
      return appState &&
        appState.authorizedAction &&
        appState.authorizedAction.length > 0
        ? appState.authorizedAction
        : [];
    }, [appState]);
    const [actionMapper, setActionMapper] = React.useState<
      Record<string, number>
    >({});

    React.useEffect(() => {
      const mapper: Record<string, number> = {};
      const regex = new RegExp(`^(${baseAction})/`, "i");
      actionContext.forEach((item: string, index: number) => {
        if (item.match(regex)) {
          mapper[item] = index;
        }
      });
      setActionMapper(mapper);
    }, [actionContext, module, baseAction]);

    const buildAction = React.useCallback(
      (action: string) => {
        return `${baseAction}/${kebabCase(action)}`;
      },
      [baseAction]
    );

    const validAction = React.useMemo(() => {
      return (action: string) => {
        if (
          !_.isEmpty(actionMapper) &&
          Object.prototype.hasOwnProperty.call(
            actionMapper,
            buildAction(action)
          )
        ) {
          return true;
        }
        return false;
      };
    }, [actionMapper, buildAction]);

    return { validAction };
  },

  useAuthorizedRoute() {
    const appState = useContext<AppState>(AppStateContext);
    const mapper = React.useMemo(() => {
      return appState &&
        appState.authorizedMenuMapper &&
        appState.authorizedMenuMapper.length > 0
        ? appState.authorizedMenuMapper
        : [];
    }, [appState]);

    const auth = React.useCallback(
      (path: string) => {
        if (path.includes("dashboard-user")) {
          return true;
        }
        if (!_.isEmpty(mapper)) {
          if (
            Object.prototype.hasOwnProperty.call(mapper, "hasAnyPermission")
          ) {
            return true;
          }
          if (!Object.prototype.hasOwnProperty.call(mapper, path)) {
            return false;
          }
        }
        return true;
      },
      [mapper]
    );

    return {
      auth,
    };
  },
};
