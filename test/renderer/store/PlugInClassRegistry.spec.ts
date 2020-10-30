import  { assert } from "chai";
import { ClassRegistry } from '../../../src/renderer/utils/registry';

describe("PlugInClassRegistry", () => {
    describe(".getInstance", () => {
        class TestClass {
            member: string

            constructor() {
                this.member = "Something"
            }
        }

        class SubTestClass extends TestClass {

        }

        const reg = new ClassRegistry<TestClass>();

        reg.register([{
            name: "Sub1",
            class: SubTestClass
        }])

        it("should return a new instance", () => {
            const instance = reg.getNewInstance("Sub1");
            assert(instance instanceof SubTestClass);
        });
        it("should throw if a unknown class is requested");
    });
});