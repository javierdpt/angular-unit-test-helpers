import { DOCUMENT } from '@angular/common';
import { InjectionToken } from '@angular/core';
import { Event, Router, RouterState, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';
import { IValueProvider } from './tests-utils.model.spec';

export class AngularCoreMocks {
    static getRouterStub(opt?: {
        serializeUrl?: string;
        snapshotUrl?: string;
    }): RouterStub {
        const subj = new Subject<Event>();
        return {
            eventsSubj: subj,
            stub: jasmine.createSpyObj<Router>(
                'Router',
                {
                    createUrlTree: {} as UrlTree,
                    serializeUrl: opt?.serializeUrl ?? 'serialized.url',
                    navigateByUrl: jasmine.createSpy() as any,
                    navigate: jasmine.createSpy() as any
                },
                {
                    url: undefined,
                    events: subj,
                    routerState: {
                        snapshot: { url: opt?.snapshotUrl ?? 'snapshot.url' } as RouterStateSnapshot
                    } as RouterState
                }
            )
        };
    }

    static getRouterProvider(): IValueProvider<Router> {
        return { provide: Router, useValue: AngularCoreMocks.getRouterStub().stub };
    }

    static getDocumentProvider(
        methodNames?: jasmine.SpyObjMethodNames<Document>,
        propertyNames?: jasmine.SpyObjPropertyNames<Document>
    ): IValueProvider<InjectionToken<Document>> {
        const pFilter = (pn: string): boolean => pn.toLowerCase() !== 'body' && pn.toLowerCase() !== 'head';
        const pNames: { [key: string]: any } = {
            body: document.body,
            head: document.head
        };
        if (propertyNames && (propertyNames as []).length) {
            (propertyNames as string[]).filter(pFilter).forEach(pn => pNames[pn] = undefined);
        } else if (propertyNames) {
            Object.keys(propertyNames).filter(pFilter).forEach(pn => pNames[pn] = (propertyNames as { [key: string]: any })[pn]);
        }
        const mFilter = (mn: string): boolean => mn.toLowerCase() !== 'createElement' &&
            mn.toLowerCase() !== 'querySelectorAll';
        const mNames: { [key: string]: any } = {
            createElement: undefined,
            querySelectorAll: undefined
        };
        if (methodNames && (methodNames as []).length) {
            (methodNames as string[]).filter(mFilter).forEach(mn => mNames[mn] = undefined);
        } else if (methodNames) {
            Object.keys(methodNames).filter(mFilter).forEach(mn => mNames[mn] = (methodNames as { [key: string]: any })[mn]);
        }
        const documentStub = jasmine.createSpyObj<Document>(
            'InjectionTokenDocumentStub',
            mNames, pNames
        );
        documentStub.createElement.and.callFake(
            (tagName: any, options?: ElementCreationOptions) => document.createElement(tagName, options)
        );
        documentStub.querySelectorAll.and.callFake(
            (selectors: any): any => document.querySelectorAll(selectors)
        );
        return { provide: DOCUMENT, useValue: documentStub as unknown as InjectionToken<Document> };
    }
}

export type RouterStub = {
    stub: jasmine.SpyObj<Router>;
    eventsSubj: Subject<Event>;
};
