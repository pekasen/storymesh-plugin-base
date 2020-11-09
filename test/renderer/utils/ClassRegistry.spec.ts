import  { assert } from "chai";
import { ClassRegistry } from '../../../src/renderer/utils/registry';


describe("ClassRegistry", () => {
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

        it("should register a subclass of its template class", () => {
            assert.doesNotThrow(() => {
                reg.register([{
                    name: "Sub1",
                    id: "Sub1",
                    class: SubTestClass
                }]);
            });
        });
        // it("should throw if the registering class is not a subclass", () => {
        //     assert.throws(() => {
        //         class SomeOtherClass {
        //             property: "LOL"
        //         }

        //         reg.register([{
        //             name: "LOL",
        //             class: SomeOtherClass
        //         }])
        //     });
        // });
        it("should return a new instance of a registered class", () => {
            const instance = reg.getNewInstance("Sub1");
            assert(instance instanceof SubTestClass);
        });
        it("should throw if a unknown class is requested", () => {
            assert.throws(() => {
                reg.getNewInstance("Something")
            });
        });
    });
});