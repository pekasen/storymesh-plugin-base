import { Component, createRef, h } from 'preact';
import { INGWebSProps, IPlugIn } from '../../utils/PlugInClassRegistry';
import { VerticalPaneGroup, VerticalMiniPane } from '../VerticalPane/VerticalPane';
import { deepObserve, IDisposer } from 'mobx-utils';
import { useContext } from 'preact/hooks';
import { Store } from '../..';

interface IPreviewProps extends INGWebSProps{
    topLevelObjectId: string
}

export class Preview extends Component<IPreviewProps> {

    private reactionDisposer: IDisposer
    private ref = createRef<HTMLDivElement>();
    private sizeObserver: ResizeObserver;

    constructor(props: IPreviewProps) {
        super(props);
        const store = useContext(Store);
        this.reactionDisposer = deepObserve(store.storyContentObjectRegistry, () => {
            console.log("Updated")
            this.setState({});
        });
        // reaction(
        //     () => (
        //         props.graph?.nodes.length
        //     ),
        //     (o) => {
        //         console.log(o);
        //         this.setState({});
        //     }
        // );
        this.sizeObserver = new ResizeObserver((entries) => console.log("Resized", entries));
    }

    componentDidMount(): void {
        if (this.ref.current) this.sizeObserver.observe(this.ref.current);
    }

    render({topLevelObjectId, registry, graph}: IPreviewProps): h.JSX.Element {
        // const g = graph?.traverse(registry, (topLevelObjectId  + ".start"))
        const children = graph?.nodes.map(id => registry.getValue(id)).filter(node => node !== undefined);

        console.log("children", children);
        return <div class="preview-container" ref={this.ref}>
                <VerticalPaneGroup>
                    <VerticalMiniPane>
                        <div class="header-preview">
                            <span>Preview</span>
                        </div>
                    </VerticalMiniPane>
                </VerticalPaneGroup>
            <div class="storywrapper">
                <div class={"ngwebs-story "} id={topLevelObjectId}>
                {
                    children?.map(node => {
                        const _node = node as unknown as IPlugIn;

                        if (node && _node.getComponent) return _node.getComponent()({
                            graph: node.childNetwork,
                            registry: registry,
                            id: node.id,
                            content: node.content,
                            modifiers: node.modifiers
                        })
                    })
                }
            </div>
        </div>
        </div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
        this.sizeObserver.disconnect();
    }
}