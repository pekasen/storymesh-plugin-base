import { createRef, h, JSX } from "preact";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";
import Quill from "quill";
import Delta from "quill";

import { useContext } from "preact/hooks";
import { Store } from "../../renderer";
import { reaction } from "mobx";
export class TextAreaMenuItem implements IMenuItemRenderer {
    quill!: Quill;
    editorRef =  createRef();
    store = useContext(Store);
    disposeReaction: any;

    
     constructor() {        
       setTimeout( () =>
        {
            this.quill = new Quill(this.editorRef.current, {
                modules: {
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    ['link', 'code-block']
                  ]
                },
                theme: 'snow'  // or 'bubble'
              }); 
              
              this.disposeReaction = reaction(
                () => ([...this.store.uistate.selectedItems.ids, this.store.uistate.selectedItems.ids.length, this.quill]), // how to watch for quill only?
                () => { 
                 // console.log("reaction quill");
                    if (this.quill && this.quill.container.parentNode) { 
                      
                      Array.from(document.getElementsByClassName("ql-toolbar")).map((item) => item.remove());
                      Array.from(document.getElementsByClassName("ql-container")).map((item) => item.remove());
                  //    this.quill.container.parentNode.removeChild(this.quill.container); 
                      this.editorRef.current.remove();
                    }
                });

               

        }, 0 );  
        
    } 
      
  
   componentDidMount() {
      /*  if (!this.editorRef) return;
        this.quill = new Quill(this.editorRef.current, {
            modules: {
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                ['link', 'code-block']
              ]
            },
            placeholder: 'Compose an epic...',
            theme: 'snow'  // or 'bubble'
          });
        // hook up change handlers...
        */
      }

      componentWillUnmount() {
        this.editorRef.current.remove(); 
        this.quill.container.parentNode.removeChild(this.quill.container);  
      }

    updateText(item: IMenuTemplate): void {
      setTimeout( () =>
      {         
          this.quill.setContents(item.value());
          this.quill.on('text-change', (delta: Delta, oldDelta: Delta, source: string) => {
            item.valueReference(this.quill.getContents());   
        });
                
      }, 120);
    }

    render(item: IMenuTemplate): JSX.Element {
     this.updateText(item);
    
      return <div>
          <label>{item.label}</label>
          <div ref={this.editorRef}></div>
      </div>
  }
}

export const plugInExport = exportClass(
    TextAreaMenuItem,
    "",
    "internal.pane.textarea",
    "",
    false
);
