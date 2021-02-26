import { createModelSchema, deserialize, list, ModelSchema, object, primitive, reference, RefLookupFunction, serialize } from 'serializr';
import { IStoryObject, StoryGraph } from 'storygraph';
import { ValueRegistry } from '../../../src/renderer/utils/registry';
import { StoryObject } from '../../../src/plugins/helpers/AbstractStoryObject';
import { EdgeSchema } from '../../../src/renderer/store/schemas/EdgeSchema';
import { identifier } from 'serializr';
import { action, makeObservable, observable } from 'mobx';
import { assert } from 'chai';
import Logger from 'js-logger';

describe("StoryGraphSchema", () => {
    class ObservableStoryGraph extends StoryGraph {
        constructor(parent: IStoryObject) {
            super(parent);
            
            makeObservable(this, {
                edges: observable,
                nodes: observable,
                addNode: action,
                removeNode: action,
                connect: action,
                disconnect: action
            });
        }
    }

    class ObservableContainer extends StoryObject {
        childNetwork: ObservableStoryGraph

        constructor() {
            super();
            this.childNetwork = new ObservableStoryGraph(this);

            makeObservable(this, {
                childNetwork: observable
            });
        }
    }
    
    const reg = new ValueRegistry<IStoryObject>();
    const StoryObjectSchema: ModelSchema<StoryObject> = {
        factory: () => {
            return new StoryObject();
        },
        props: {
            id: identifier(),
            name: primitive(),
            role: false,
            renderingProperties: false,
            metaData: false,
            userDefinedProperties: false,
            updateConnections: false,
            deletable: false,
            getEditorComponent: false,
            isContentNode: false,
            getComponent: false,
            connections: false,
            connectors: false,
            childNetwork: false,
            content: false,
            menuTemplate: false,
            willDeregister: false,
            icon: false,
            modifiers: false
        }
    };
    const lookUpNode: RefLookupFunction = (id: string, callback) => {
        const instance = reg.getValue(id);
        Logger.info(instance);
        if (instance) callback(null, instance);
    };
    const StoryGraphSchema: ModelSchema<StoryGraph> = {
        factory: (context) => {
            if (context && context.parentContext && context.parentContext.target) return new StoryGraph(context.parentContext.target);
            else {
                Logger.info("LEG2");
                return new StoryGraph(con1);
            }
        },
        props: {
            nodes: list(reference(StoryObjectSchema, lookUpNode)),
            edges: list(object(EdgeSchema)),
            parent: reference(StoryObjectSchema, lookUpNode),
            addNode: false,
            connect: false,
            disconnect: false,
            removeNode: false,
            willDeregister: false,
            traverse: false,
            filterNodes: false,
            filterEdges: false
        }
    };
    const ObservableStoryGraphSchema: ModelSchema<ObservableStoryGraph> = {
        factory: (context) => {
            if (context && context.parentContext && context.parentContext.target) return new ObservableStoryGraph(context.parentContext.target);
            else {
                Logger.info("LEG2");
                return new ObservableStoryGraph(con1);
            }
        },
        props: {
            nodes: list(reference(StoryObjectSchema, lookUpNode)),
            edges: list(object(EdgeSchema)),
            parent: reference(StoryObjectSchema, lookUpNode),
            addNode: false,
            connect: false,
            disconnect: false,
            removeNode: false,
            willDeregister: false,
            traverse: false,
            filterNodes: false,
            filterEdges: false
        }
    };
    const StoryObjectSchemaMobX = {...StoryObjectSchema};
    StoryObjectSchemaMobX.props.childNetwork = object(ObservableStoryGraphSchema);
    StoryObjectSchema.props.childNetwork = object(StoryGraphSchema);

    createModelSchema(ObservableStoryGraph, {
        nodes: list(reference(StoryObjectSchema, lookUpNode)),
        edges: list(object(EdgeSchema)),
        parent: reference(StoryObjectSchema, lookUpNode),
    });
    createModelSchema(ObservableContainer, {
        childNetwork: object(ObservableStoryGraph)
    })

    /**
     * SETUP ALL INSTANCES
     */
    const con1 = new StoryObject();
    con1.metaData = {
        createdAt: new Date(),
        name: "Philipp",
        tags: []
    };
    con1.id = "1";
    con1.name = "Alpha";

    const con1a = new ObservableContainer();
    con1a.metaData = {
        createdAt: new Date(),
        name: "Philipp",
        tags: []
    };
    con1a.id = "1";
    con1a.name = "Alpha"

    const con2 = {...con1};
    con2.id = "2";
    con2.name = "Beta";
    const con3 = {...con1};
    con3.id = "3"
    con3.name = "Gamma";
    con1.childNetwork = new ObservableStoryGraph(con1);
    reg.register(con1)

    con1.childNetwork.addNode(reg, con2);
    con1.childNetwork.addNode(reg, con3);
    con1a.childNetwork.addNode(reg, con2);
    con1a.childNetwork.addNode(reg, con3);

    let json: any;
    let json2: any;

    if (con1) {
        describe("serializiation", () => {
            it("should serialize a StoryGraph", () => {
                json = serialize(StoryGraphSchema, con1.childNetwork);
                // Logger.info("serialized:", json)
                assert.deepEqual(json, {nodes: ["2", "3"], edges: [], parent: "1"})
            });
            it("should serialize a StoryObject with a StoryGraph", () => {
                json2 = serialize(
                    StoryObjectSchema, con1
                );

                Logger.info(json2);
                assert.deepEqual(json2, {
                    id: '1',
                    name: 'Alpha',
                    childNetwork: { nodes: [ '2', '3' ], edges: [], parent: '1' }
                });
            });
            it("should serialize a ObservableStoryGraph", () => {
                const ob = new ObservableStoryGraph(con1a);
                ob.addNode(reg, con2);
                ob.addNode(reg, con3);

                const obJson = serialize(ObservableStoryGraphSchema, ob);
                Logger.info(obJson)
                assert.deepEqual(obJson, {nodes: ["2", "3"], edges: [], parent: "1"})
            });
        });
        describe("deserialization", () => {
            it("should deserialize a StoryGraph to an Observable", () => {
                const g1 = deserialize(ObservableStoryGraph, json);

                Logger.info("deserialized", g1);
                // assert.deepEqual(g1, con1a.childNetwork);
            });

            it("should deserialize a StoryObject with StoryGraph", () => {
                const o1 = deserialize(StoryObjectSchema, json2);
                Logger.info(o1);
                assert.deepEqual(o1, con1);
            });
            let o2: ObservableContainer;
            it("should deserialize a StoryObject with StoryGraph and not interfere with MobX", () => {
                o2 = deserialize(ObservableContainer, json2);
                Logger.info(o2);
                // assert.deepEqual(o2, con1 as StoryObject);
                assert.hasAnyKeys(o2, ["childNetwork"]);
                
                Logger.info("Contructor", o2.constructor);
                Logger.info(o2.childNetwork.nodes.map(e => e.id))
            });
            it("should have references to its children", () => {
                assert.deepEqual(
                    o2.childNetwork.nodes.map(e => e.id),
                    ["2", "3"]
                )
            });
        });
    }
});