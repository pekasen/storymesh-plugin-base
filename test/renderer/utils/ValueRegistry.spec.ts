import { ValueRegistry } from "../../../src/renderer/utils/registry"
import { assert } from "chai";

describe('ValueRegistry', () => {

    describe("Basic Suite", () => {
        const reg = new ValueRegistry<number>()

        describe(".register", () => {
            it("should accept a new value", () => {
                assert.isOk(
                    reg.registerValue({
                        id: "Bert",
                        value: 42
                }));
            });
            it("should reject a duplicated value", () => {
                assert.isNotOk(
                    reg.registerValue({
                        id: "Bert",
                        value: 42
                    })
                );
            });
            
        });
        describe(".getRegisteredValue", () => {
            reg.registerValue({
                id: "val1",
                value: 1
            });

            it("should return undefined of a unknown value is requested", () => {
                assert(reg.getRegisteredValue("val2") === undefined);
            });
        });
        describe(".deregisterValue", () => {
            it("should deregister a value absed on its id", () => {
                reg.deregisterValue("bert");
                assert(reg.getRegisteredValue("bert") === undefined);
            });
        });
    });

    describe("Advanced Types Test Suite", () => {
        
        class TestClass {
            id: string
            childrenId?: string | TestClass

            constructor(id: string, childrenId?: string) {
                this.id = id;
                if (childrenId) this.childrenId = childrenId
            }

            denormalize(registry: ValueRegistry<TestClass>) {
                if (this.childrenId && !(this.childrenId instanceof TestClass)) {
                    const data = registry.getRegisteredValue(this.childrenId);
                    if (data) {
                        this.childrenId = data;
                        return true
                    }
                }
                return false
            }
        }

        const t1 = new TestClass("T1");
        const t2 = new TestClass("T2", "T1")

        const reg = new ValueRegistry<TestClass>();
        reg.registerValue({id: "T1", value: t1});
        reg.registerValue({id: "T2", value: t2});
        
        describe(".getRegisteredValue", () => {
            it("should do something", () => {
                assert.isOk(t2.denormalize(reg));
            });
            it("should do something2", () => {
                assert.deepEqual(t2.childrenId, t1);
            });
        });
    });
})