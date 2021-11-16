import { AbstractType, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import dayjs from 'dayjs';

export class TestUtils {
    static getValueProvider<T>(providerType: ProviderType<T> | InjectionToken<T> | AbstractType<T>, providerValue: T): IValueProvider<T> {
        return { provide: providerType, useValue: providerValue };
    }

    static getClassProvider<T, TClass extends T>(
        providerType: ProviderType<T> | InjectionToken<T> | AbstractType<T>,
        providerValue: ProviderType<TClass> | InjectionToken<TClass> | AbstractType<TClass>
    ): IClassProvider<T> {
        return { provide: providerType, useClass: providerValue };
    }

    static getMockedValueProvider<T>(
        providerType: ProviderType<T> | InjectionToken<T> | AbstractType<T>,
        methodNames?: jasmine.SpyObjMethodNames<T> | null,
        propertyNames?: jasmine.SpyObjPropertyNames<T>
    ): IValueProvider<T> {
        return this.getValueProvider(
            providerType,
            this.createSpyObj(providerType, methodNames, propertyNames)
        );
    }

    static createSpyObj<T>(
        providerType: ProviderType<T> | InjectionToken<T> | AbstractType<T>,
        methodNames?: jasmine.SpyObjMethodNames<T> | null,
        propertyNames?: jasmine.SpyObjPropertyNames<T>
    ): jasmine.SpyObj<T> {
        return jasmine.createSpyObj<T>(
            this._getClassName(providerType),
            methodNames ?? ['toString'] as any,
            propertyNames
        );
    }

    static getFormattedDate(date?: Date | dayjs.Dayjs): string {
        if (!date) { return 'undefined'; }
        return dayjs(date).format('MM/DD/YYYY');
    }

    /**
     * Test utility to set values for spied property (jasmine.github.io)
     *
     * Example
     * ```ts
     * beforeEach(function() {
     *   this.propertySpy = spyOnProperty(someObject, "myValue", "get").and.returnValue(1);
     * });
     *
     * it("lets you change the spy strategy later", function() {
     *   this.propertySpy.and.returnValue(3);
     *   expect(someObject.myValue).toEqual(3);
     * })
     * ```
     *
     * @param token Service to be injected
     * @param prop Property name
     * @param value Value to be set
     * @link https://jasmine.github.io/tutorials/spying_on_properties
     */
    static setSpiedObjGetter<T, TProp extends keyof T, TValue extends T[TProp]>(token: T, prop: TProp, value: TValue): void {
        (Object.getOwnPropertyDescriptor(token, prop)!.get as jasmine.Spy).and.returnValue(value);
    }

    static setSpiedObjGetterCallFake<T, TProp extends keyof T, TValue extends T[TProp]>(
        token: T, prop: TProp, fn: (index: number) => TValue
    ): void {
        class CallFakeExecutionContext {
            callCounter = 0;
            constructor(private _fn: (index: number) => TValue) { }
            call = (): TValue => this._fn(++this.callCounter);
        }
        (Object.getOwnPropertyDescriptor(token, prop)!.get as jasmine.Spy).and.callFake(new CallFakeExecutionContext(fn).call);
    }

    static inject<T>(providerType: ProviderType<T> | InjectionToken<T> | AbstractType<T>): jasmine.SpyObj<T> {
        return TestBed.inject(providerType) as jasmine.SpyObj<T>;
    }

    private static _getClassName<T>(providerType: (new (...args: any[]) => T) | InjectionToken<T> | AbstractType<T>): string {
        if (providerType instanceof InjectionToken) {
            return (providerType as any)._desc;
        }

        if (providerType.name) {
            return providerType.name;
        }

        let res = providerType.toString();
        res = res.substr('function '.length);
        res = res.substr(0, res.indexOf('('));
        return res;
    }
}

export type ProviderType<T> = new (...args: any[]) => T;

export type IValueProvider<T> = {
    provide: ProviderType<T> | InjectionToken<T> | AbstractType<T>;
    useValue: T;
};

export type IClassProvider<T> = {
    provide: ProviderType<T> | InjectionToken<T> | AbstractType<T>;
    useClass: ProviderType<T> | InjectionToken<T> | AbstractType<T>;
};

export abstract class ObjectsMocks {
    abstract get providers(): any[];

    getProvider<T>(
        provide: ProviderType<T> | InjectionToken<T>,
        valueSelector: (objectsMocks: ObjectsMocks) => any
    ): IValueProvider<T> {
        return {
            provide,
            useValue: valueSelector(this)
        };
    }
}
