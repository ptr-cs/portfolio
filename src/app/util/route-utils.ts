import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common"

export function getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    let r = route;
    while (r.firstChild) r = r.firstChild;
    return r;
}

export function prepareRouteWithLangParam(languageCode: string, router: any, ngLocation: Location) {
    const current = getDeepestChild(router.routerState.root);
    const currentUrl = ngLocation.path(true);
    const tree = router.parseUrl(currentUrl);
    const fragmentFromUrl = tree.fragment ?? null;
    
    router.navigate([], {
    relativeTo: current,
    queryParams: { lang: languageCode },
    queryParamsHandling: 'merge',
    replaceUrl: true,
    fragment: fragmentFromUrl
    });
}

export function getCurrentHashRoute(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  return hash ? hash.replace(/^#/, '') : null;
}

export function updateUrl(fragment: string, route: any, router: Router, location: any): void {
    let r = getDeepestChild(route)

    const urlTree = router.createUrlTree([], {
      relativeTo: r,
      queryParamsHandling: 'merge',
      fragment: fragment
    });

    location.replaceState(router.serializeUrl(urlTree));
  }