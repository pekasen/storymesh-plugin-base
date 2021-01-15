# The ultimative plug-in creation tutorial

## Step One: Creat'a file!

Go to the plugins folder `./src/plugins` and create a new tsx-file `touch ImageObject.tsx` and open it in VS Code.

## Step Two: Declare a class!

First we import all plug-ins superclass from the plugin/helper-folder and declare a new class:

```typescript
import { StoryObject } from "./helpers/AbstractStoryObject";

class ImageObject extends StoryObject {
```

OK, now let's declare the stuff that is necessary to model the image objects behavior. First of all we need to set an icon which is as the default icon for the object.

```typescript
    static defaultIcon = "icon-picture";
```

Then we go on and set some default values for our object. The `name`property sets the default name for new objects, `role` is used to determine the class to use when deserializing data back into the app. `isContentNode` and `userDefinedProperties` are what the name says.

```typescript
    public name = "Image";
    public role = "internal.content.image";
    public isContentNode = true;
    public userDefinedProperties = {};
```

Then we create the initial content object.

```typescript
    public content = {
        resource: "https://giphy.com/gifs/vibes-positive-stay-Xg4U4CS5CdubuXVAVy",
        contentType: "url",
        altText: "This is a GIF image"    
    };
```

### Menus

Now stuff get's a lot more interesting: when clicking on a objects representation in the node-area we'll like to have a menu from which we can modify values and settings of the given object. This is declared via the `menuTemplate` property. This accepts an array of menu specifications in the following form: 

```typescript
    export interface IMenuTemplate {
        label: string;
        type: MenuItemSpecification;
        valueReference: (...args: any[]) => void;
        value: (() => any);
        options?: string[];
    }
```

Where the label is the label which is displayed for the field in the sidebar pane, the type can be: 

```typescript
export type MenuItemSpecification = "table" |
    "radio" |
    "button" |
    "textarea" |
    "text" |
    "hslider" |
    "vslider" |
    "dropdown" |
    "check" |
    "file-selector" |
    "url" |
    "color";
```

There are already a few helper functions to achieve this for the standard fields in basically no time: for instance calling the `nameField` function from the pluginhelpers creates a menu item which accesses the object's name field and changes it accordingly.

```typescript
    public menuTemplate: IMenuTemplate[] = [
        ...nameField(this);
    ];
```
Side note: the destructuring syntax is necessary because we want to concatenate a few different functions and, thus, arrays together.

This will likely cause a error, since `nameField`expects our class not only to be a IStoryObject, but also to implement the `INameFieldMethods` interface.

```typescript
interface INameFieldMethods {
    updateName: (name: string) => void
}
```
In this method we will set the name property to whatever the user sets it to.

```typescript
    public updateName(name: string): void {
        this.name = name;
    }
```

There are few more helper functions to choose from: `dropDownField`, `connectionField`. But it is still very likely we are going to roll our own custom menu items, e.g. for changing the ImageObject's image URL. For this, we need to create an object with the specifications of this item and plug it into the beforehand defined array.

```typescript
public menuTemplate: IMenuTemplate[] = [
        ...nameField(this),
        {
            label: "Image URL",
            type: "text",
            value: () => this.content.resource,
            valueReference: (url: string) => this.updateImageURL(url)
        },
        ...connectionField(this),
    ];
```

Where, label is of course the label in the sidebar, type is the UI type to use. `value` is a function that returns the value to display in the menu item and `valuereference` is a function that calls a method in our object to update the stored value.

> **Note**: The reason we need to call a method is that we employ MobX for observability and during this process these methods are marked as *actions*. Actions alter observable values and MobX complains when values are altered from *not within* an action, as it is harder to keep track of those. Although the `runInAction()` function can be used to circumvent this issue: `valueReference: (url: string) => runInAction(() => {this.content.resource = url})`. But, since we have full control over our classes it is a cleaner solution to do this via methods and we can see on first glance which mutation are possible for a given class.


### Connectors

Next we define which connectors this object should have and how they behave. Connectors are defined in StoryGraph und we must implement the interfaces defined there:

```typescript
interface IConnectorPort {
    name: string
    direction: ConnectorDirection
    type: ConnectorType
    associated?: IConnectorPort
}

type ConnectorType = "flow" | "reaction" | "data";
type ConnectorDirection = "in" | "out";
```

Each connector port must have a name, a direction (`"in"`or `"out"`) and a type (`"flow"`, `"reaction"` or `"data"`). For the flow connections type we must declare which output is associated to which input.

*Note:* the super class provides a convenience method to create a pair of associated flow connectors, which we can call from the constructor.

```typescript
    constructor() {
        super();

        this.connectors = new Map<string, IConnectorPort>();
        this.makeFlowInAndOut();
    }
```

### Components

Lastly, we need to define *how* the content of this object is rendered in the story (and the editor). We do this by declaring a method which returns a Preact function component. This component will be passed a object of the `INGWebSProps`type, which is a conglomerate of the properties of our ImageObject.

```typescript
interface INGWebSProps {
    id: string
    registry: ValueRegistry<IStoryObject>
    renderingProperties?: IRenderingProperties
    content?: IContent
    modifiers?: IStoryModifier[]
    graph?: StoryGraph
}
```

```typescript
    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
                return <img src={content?.resource}></img>
            }
        return Comp
    }
```

## Step Three: Make it observable!

In order to have our app react to changes in the image object's properties (i.e. from the user interface) we need it to be MobX-observable. Luckily,this is extremely easy.

We need to modify our constructor just a tiny bit:

```typescript
    constructor() {
        super();

        this.connectors = new Map<string, IConnectorPort>();
        this.makeFlowInAndOut();

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            connectors: observable.shallow,
            content: observable,
            updateName: action,
            updateImageURL: action
        });
    }
```

The function `makeObservable` is imported from MobX, it takes as first parameter the object to make observable and secondly, a object of specifications which properties should be observable and which *methods* are action that modify these properties' values.

## Step Four: Make it serializable!

Now to make it serializable, since we want to persist our objects to a JSON on disk. We employ the `serialzr` package for this and simply need to declare which fields should be serialized and how. Luckily all the standard fields are already declared in the super-class constructor and we just need to define a model schema, which calls the super-classes` model schema. Doing this is straight forward:

```
import { createModelSchema } from 'serializr';
```
The created model schema is conveniently stored in the class constructor and we do not need to care more about it.

## Step Five: 'xport it!

The plug-in interface expects that this file exports an object called plugInExport, this gives a few basic metadata about this plugin and transports the above defined class into the Editor. This object is created by a call to `exportClass` which has to be imported from `./helpers/exportClass`.

The function has the following call signature `exportClass(class: StoryObject, name: string, id: string, icon: string, public: boolean)`

```typescript
export const plugInExport = exportClass(
    ImageObject, // class
    "Image", // display name
    "internal.content.image", // id for the registry
    ImageObject.defaultIcon, // icon to be displayed
    true // is it a public plugin, i.e. is it displayed in the template pane?
)
```

### Wrap-up

The entire code:
```
import { makeObservable, observable, action } from 'mobx';
import { FunctionComponent, h } from 'preact';
import { createModelSchema } from 'serializr';
import { IConnectorPort } from 'storygraph';
import { IMenuTemplate, INGWebSProps } from '../renderer/utils/PlugInClassRegistry';

import { StoryObject } from "./helpers/AbstractStoryObject";
import { exportClass } from './helpers/exportClass';
import { connectionField, nameField } from './helpers/plugInHelpers';

class ImageObject extends StoryObject {
    static defaultIcon = "icon-picture";

    public name = "Image";
    public role = "internal.content.image";
    public isContentNode = true;
    public userDefinedProperties = {};
    public content = {
        resource: "https://giphy.com/gifs/vibes-positive-stay-Xg4U4CS5CdubuXVAVy",
        contentType: "url",
        altText: "This is a GIF image"    
    };
    public menuTemplate: IMenuTemplate[] = [
        ...nameField(this),
        ...connectionField(this)
    ]
    public connectors: Map<string, IConnectorPort>;

    constructor() {
        super();

        this.connectors = new Map<string, IConnectorPort>();
        this.makeFlowInAndOut();

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            connectors: observable.shallow,
            content: observable,
            updateName: action,
            // updateImageURL: action
        });
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
                return <img src={content?.resource}></img>
            }
        return Comp
    }
}

createModelSchema(ImageObject, {});

export const plugInExport = exportClass(
    ImageObject,
    "Image",
    "internal.content.image",
    ImageObject.defaultIcon,
    true
);
```
