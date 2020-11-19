import { Component, Fragment, h } from 'preact';
import { INGWebSProps, IPlugIn } from '../../utils/PlugInClassRegistry';
import { VerticalPane, VerticalPaneGroup, VerticalMiniPane } from '../VerticalPane/VerticalPane';
import { IReactionDisposer, reaction } from "mobx"

interface IPreviewProps extends INGWebSProps{
    topLevelObjectId: string
}

export class Preview extends Component<IPreviewProps> {

    reactionDisposer: IReactionDisposer

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
        )
    }

    render({topLevelObjectId, registry, graph}: IPreviewProps): h.JSX.Element {
        // const g = graph?.traverse(registry, (topLevelObjectId  + ".start"))
        const children = graph?.nodes
        console.log("children", children);
        return <div class="preview-container">
                <VerticalPaneGroup>
                    <VerticalMiniPane>
                        <div class="header-preview">
                            <span>Preview</span>
                        </div>
                    </VerticalMiniPane>
                </VerticalPaneGroup>
            <div class={"ngwebs-story " + topLevelObjectId}>{
            children?.map(node => {
                const _node = node as unknown as IPlugIn;

                return _node.getComponent()({
                    graph: node.childNetwork,
                    registry: registry,
                    id: node.id,
                    content: node.content
                })
            })
        }</div>
        </div>
    }
}