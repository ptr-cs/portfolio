import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { getDeepestChild, getCurrentHashRoute, updateUrl, prepareRouteWithLangParam } from './route-utils';

describe('route-utils', () => {
  describe('getDeepestChild', () => {
    it('returns the deepest nested route', () => {
      const leaf = {} as ActivatedRoute;
      const middle = { firstChild: leaf } as ActivatedRoute;
      const root = { firstChild: middle } as ActivatedRoute;

      expect(getDeepestChild(root)).toBe(leaf);
    });
  });

  describe('prepareRouteWithLangParam', () => {
    it('navigates with lang parameter while preserving fragment', () => {
      const mockRoute = { routerState: { root: {} } };
      const mockUrlTree = { fragment: 'section' };
      const router = {
        routerState: { root: mockRoute },
        parseUrl: jasmine.createSpy('parseUrl').and.returnValue(mockUrlTree),
        navigate: jasmine.createSpy('navigate')
      } as unknown as Router;
      const location = {
        path: jasmine.createSpy('path').and.returnValue('/sample#section')
      } as unknown as Location;

      prepareRouteWithLangParam('fr', router, location);

      expect(router.parseUrl).toHaveBeenCalledWith('/sample#section');
      expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
        queryParams: { lang: 'fr' },
        fragment: 'section'
      }));
    });
  });

  describe('updateUrl', () => {
    it('replaces browser state with new fragment', () => {
      const deepest = {};
      const route = { firstChild: deepest } as ActivatedRoute;
      const router = {
        createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
        serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/sample#new')
      } as unknown as Router;
      const location = { replaceState: jasmine.createSpy('replaceState') } as unknown as Location;

      updateUrl('new', route, router, location);

      expect(router.createUrlTree).toHaveBeenCalled();
      expect(location.replaceState).toHaveBeenCalledWith('/sample#new');
    });
  });
});
