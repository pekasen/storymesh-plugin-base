import { FunctionComponent, h } from 'preact';
// import "./StoryComponentGallery.css";

const expandGallery = () => {
    const gallery = document.getElementById('item-gallery');
    gallery?.classList.toggle('expanded');
}

export const Gallery: FunctionComponent = ({ children, }) => (
    <div class="item-gallery-container" id="item-gallery">
        <div class="expander" id="gallery-expander" onClick={expandGallery}>
            <span class="icon icon-up-open"></span>
        </div>
        <h3 class="header expanded-visible">Story Components</h3>
        <ul class="gallery-list">{children}</ul>
    </div>
);

export const StoryComponentGallery: FunctionComponent = ({ children }) => (
    <Gallery>
        {children}
    </Gallery>
)
