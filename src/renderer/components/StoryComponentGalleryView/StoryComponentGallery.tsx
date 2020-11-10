import { FunctionComponent, h } from 'preact';
// import "./StoryComponentGallery.css";

export const Gallery: FunctionComponent = ({ children }) => (
    <ul class="gallery-container">{children}</ul>
);

export const StoryComponentGallery: FunctionComponent = ({ children }) => (
    <Gallery>
            {children}
    </Gallery>
)
