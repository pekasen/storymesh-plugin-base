import { Component, createRef, Fragment, h, Ref } from 'preact';
import { INGWebSProps, IPlugIn } from '../../utils/PlugInClassRegistry';
import { VerticalPane, VerticalPaneGroup, VerticalMiniPane } from '../VerticalPane/VerticalPane';
import { IReactionDisposer, reaction } from "mobx"
import { useRef } from 'preact/hooks';

interface IPreviewProps extends INGWebSProps{
    topLevelObjectId: string
}

export class Preview extends Component<IPreviewProps> {

    reactionDisposer: IReactionDisposer
    ref: Ref<HTMLDivElement>;

    constructor(props: IPreviewProps) {
        super(props);

        this.reactionDisposer = reaction(
            () => (
                props.graph?.nodes.length
            ),
            (o) => {
                console.log(o);
                this.setState({});
            }
        );
        this.ref = createRef();
    }

    componentDidMount(): void {
        const resizeObs = new ResizeObserver((entries) => console.log("Resized", entries));
        
        if (this.ref.current) resizeObs.observe(this.ref.current);
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

                        if (node) return _node.getComponent()({
                            graph: node.childNetwork,
                            registry: registry,
                            id: node.id,
                            content: node.content
                        })
                    })
                }
            </div>
        </div>
        </div>
    }
}