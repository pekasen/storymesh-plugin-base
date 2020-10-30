import { assert } from "chai";
import { ValueRegistry } from "../../../src/renderer/utils/registry"

describe('ValueRegistry', () => {

    const reg = new ValueRegistry<number>()

    describe(".register", () => {
        it("should accept a new value", () => {
            reg.registerValue({
                id: "Bert",
                value: 42
            });

            assert(reg.registry.length === 1);
        });
        it("should reject a duplicated value", () => {
            assert.throws(() => {
                reg.registerValue({
                    id: "Bert",
                    value: 42
                });
            });
        });
        it("should deregister a value absed on its id")
    });
    describe(".getRegisteredValue", () => {
        it("should return undefined of a unknown value is requested");
    });
})