import { Component, createRef, FunctionComponent, h } from 'preact';
import Logger from 'js-logger';
import { INGWebSProps } from '../../utils/PlugInClassRegistry';
import { VerticalPaneGroup, VerticalMiniPane, VerticalPane } from '../VerticalPane/VerticalPane';
import { deepObserve, IDisposer } from 'mobx-utils';
import { useContext } from 'preact/hooks';
import { Store } from '../..';
import { StoryObject } from '../../../plugins/helpers/AbstractStoryObject';
import { RootStore } from '../../store/rootStore';

interface IPreviewWrapperProps extends INGWebSProps {
    topLevelObjectId: string
}

interface IPreviewProps extends IPreviewWrapperProps {
    store: RootStore
}

type WidthClass = "XS" | "SM" | "MD" | "LG" | "XL";

interface IPreviewState {
    classes: WidthClass[]
}

export const Preview: FunctionComponent<IPreviewWrapperProps> = (props) => {
    const store = useContext(Store);
    return <Preview2 store={store} {...props}/>
}
export class Preview2 extends Component<IPreviewProps, IPreviewState> {

    private reactionDisposer: IDisposer
    private ref = createRef<HTMLDivElement>();
    private sizeObserver: ResizeObserver;
    private logger = Logger.get("Preview");

    constructor(props: IPreviewProps) {
        super(props);
        const store = props.store;
        // TODO: debounce user input
        this.reactionDisposer = deepObserve(store, (e) => {
            this.logger.info("Updated", e)
            this.setState({
                classes: this.state.classes
            });
        });

        this.state = {
            classes: ["XS"]
        };

        this.sizeObserver = new ResizeObserver((entries: { contentRect: { width: any; }; }[]) => {
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

    render({ }: IPreviewProps, { classes }: IPreviewState): h.JSX.Element {
        const store = useContext(Store);
        const topLevelObjectId = store.uistate.topLevelObjectID;
        const topLevelObject = store.storyContentObjectRegistry.getValue(topLevelObjectId);
        if (!topLevelObject ) throw("BIGGY!");
        // if (!topLevelObject.getComponent) throw("BIGGY!2");
        const Elem = topLevelObject.getComponent();
        if (!Elem) throw("BIGGY!3");

        this.logger.info("Previewing component", Elem);
        // Logger.info("children", children);
        // TODO: refactor so that peripharals are outside this component
        return <div class="preview-container" >
            <VerticalPaneGroup>
                {/* <VerticalMiniPane>
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
                </VerticalMiniPane> */}
                <VerticalPane>
                    <div class={`storywrapper ${classes.join(" ")}`} ref={this.ref}>
                        <div class={"ngwebs-story "} id={topLevelObjectId}>
                            <Elem 
                                registry={store.storyContentObjectRegistry}
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