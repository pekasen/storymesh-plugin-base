import { Component, createRef, h } from 'preact';
import { INGWebSProps } from '../../utils/PlugInClassRegistry';
import { VerticalPaneGroup, VerticalMiniPane, VerticalPane } from '../VerticalPane/VerticalPane';
import { deepObserve, IDisposer } from 'mobx-utils';
import { useContext } from 'preact/hooks';
import { Store } from '../..';
import { AbstractStoryObject } from '../../../plugins/helpers/AbstractStoryObject';

interface IPreviewProps extends INGWebSProps {
    topLevelObjectId: string
}

type WidthClass = "XS" | "SM" | "MD" | "LG" | "XL";

interface IPreviewState {
    classes: WidthClass[]
}

export class Preview extends Component<IPreviewProps, IPreviewState> {

    private reactionDisposer: IDisposer
    private ref = createRef<HTMLDivElement>();
    private sizeObserver: ResizeObserver;

    constructor(props: IPreviewProps) {
        super(props);
        const store = useContext(Store);
        // TODO: debounce user input
        this.reactionDisposer = deepObserve(store.storyContentObjectRegistry, () => {
            console.log("Updated")
            this.setState({});
        });

        this.state = {
            classes: ["XS"]
        };

        this.sizeObserver = new ResizeObserver((entries) => {
            const storyDivWidth = entries[0].contentRect.width;
            const classString: WidthClass[] = this.getCurrentWidthClass(storyDivWidth);

            this.setState({
                classes: classString
            });
        });
    }

    private getCurrentWidthClass(width: number) {
        const classes = [
            { class: "XS", condition: (x: number) => x >= 0 },
            { class: "SM", condition: (x: number) => x >= 576 },
            { class: "MD", condition: (x: number) => x >= 768 },
            { class: "LG", condition: (x: number) => x >= 960 },
            { class: "XL", condition: (x: number) => x >= 1200 },
        ];

        return classes.filter(e => e.condition(width)).map(e => e.class as WidthClass);
    }

    componentDidMount(): void {
        if (this.ref.current) {
            this.sizeObserver.observe(this.ref.current);
            const width = this.ref.current.offsetWidth;
            const classString: WidthClass[] = this.getCurrentWidthClass(width);

            this.setState({
                classes: classString
            });
        }
    }

    render({ topLevelObjectId, registry }: IPreviewProps, { classes }: IPreviewState): h.JSX.Element {
        // const g = graph?.traverse(registry, (topLevelObjectId  + ".start"))
        // const children = graph?.nodes.map(id => registry.getValue(id)).filter(node => node !== undefined);
        const topLevelObject = registry.getValue(topLevelObjectId) as AbstractStoryObject | undefined;
        if (!topLevelObject ) throw("BIGGY!");
        if (!topLevelObject.getComponent) throw("BIGGY!2");
        const Elem = topLevelObject.getComponent();
        if (!Elem) throw("BIGGY!3");

        // console.log("children", children);
        // TODO: refactor so that peripharals are outside this component
        return <div class="preview-container" >
            <VerticalPaneGroup>
                <VerticalMiniPane>
                    <div class="header-preview">
                        <div class="btn-group">
                            <button class="btn btn-mini btn-default">
                                <span class="icon icon-mobile"></span>
                            </button>
                            <button class="btn btn-mini btn-default">
                                <span class="icon icon-doc"></span>
                            </button>
                            <button class="active btn btn-mini btn-default">
                                <span class="icon icon-monitor"></span>
                            </button>
                        </div>
                    </div>
                </VerticalMiniPane>
                <VerticalPane>
                    <div class={`storywrapper ${classes.join(" ")}`} ref={this.ref}>
                        <div class={"ngwebs-story "} id={topLevelObjectId}>
                            <Elem 
                                registry={registry}
                                id={topLevelObjectId}
                                renderingProperties={topLevelObject.renderingProperties}
                                content={topLevelObject.content}
                                modifiers={topLevelObject.modifiers}
                                graph={topLevelObject.childNetwork}
                                userDefinedProperties={topLevelObject.userDefinedProperties}
                            />
                        </div>
                    </div>
                </VerticalPane>
            </VerticalPaneGroup>
        </div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
        this.sizeObserver.disconnect();
    }
}