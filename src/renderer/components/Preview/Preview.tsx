import { Component, createRef, h } from 'preact';
import { INGWebSProps, IPlugIn } from '../../utils/PlugInClassRegistry';
import { VerticalPaneGroup, VerticalMiniPane } from '../VerticalPane/VerticalPane';
import { IReactionDisposer, reaction } from "mobx"

interface IPreviewProps extends INGWebSProps{
    topLevelObjectId: string
}

type WidthClass = "XS" | "SM" | "MD" | "LG" | "XL";

interface IPreviewState {
    classes: WidthClass[]
}

export class Preview extends Component<IPreviewProps, IPreviewState> {

    private reactionDisposer: IReactionDisposer
    private ref = createRef<HTMLDivElement>();
    private sizeObserver: ResizeObserver;

    constructor(props: IPreviewProps) {
        super(props);
        this.state = {
            classes: ["XS"]
        };
        this.reactionDisposer = reaction(
            () => (
                props.graph?.nodes.length
            ),
            (o) => {
                console.log(o);
                this.setState({});
            }
        );
        this.sizeObserver = new ResizeObserver((entries) => {
            // <576px = XS, 576 = SM, 768 = MD, 960 = LG, 1200 = XL?
            
            const storyDivWidth = entries[0].contentRect.width;
            const classString: WidthClass[] = this.getCurrentWidthClass(storyDivWidth);
            
            this.setState({
                classes: classString
            });
        });
    }

    private getCurrentWidthClass(width: number) {
        const classes = [
            {class: "XS", condition: (x: number) => x >= 0},
            {class: "SM", condition: (x: number) => x >= 576},
            {class: "MD", condition: (x: number) => x >= 768},
            {class: "LG", condition: (x: number) => x >= 960},
            {class: "XL", condition: (x: number) => x >= 1200},
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

    render({topLevelObjectId, registry, graph}: IPreviewProps, { classes }: IPreviewState): h.JSX.Element {
        // const g = graph?.traverse(registry, (topLevelObjectId  + ".start"))
        const children = graph?.nodes.map(id => registry.getValue(id)).filter(node => node !== undefined);

        console.log("children", children);
        return <div class="preview-container" >
                <VerticalPaneGroup>
                    <VerticalMiniPane>
                        <div class="header-preview">
                            <span>Preview</span>
                        </div>
                    </VerticalMiniPane>
                </VerticalPaneGroup>
            <div class={`storywrapper ${classes.join(" ")}`} ref={this.ref}>
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

    componentWillUnmount(): void {
        this.reactionDisposer();
        this.sizeObserver.disconnect();
    }
}