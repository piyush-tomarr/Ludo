import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid, SearchBar, SearchContext, SearchContextManager } from '@giphy/react-components';

// This is a placeholder for the user's Giphy API key. 
// They can replace it with their real key in the future.
const gf = new GiphyFetch('sX7uuxUTAs9S13Wv56fP9YtA1L37q5R6'); // Using a common demo key or placeholder

const GiphyGrid = ({ onGifClick }) => {
    const { fetchGifs, searchKey } = React.useContext(SearchContext);
    return (
        <Grid
            onGifClick={(gif, e) => {
                e.preventDefault();
                onGifClick(gif.images.fixed_height.url);
            }}
            fetchGifs={fetchGifs}
            width={380}
            columns={2}
            gutter={6}
            hideAttribution={true}
            key={searchKey}
        />
    );
};

const GiphyPicker = ({ onGifSelect }) => {
    return (
        <SearchContextManager apiKey={'sX7uuxUTAs9S13Wv56fP9YtA1L37q5R6'}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
                <SearchBar 
                    placeholder="Search GIFs & Stickers" 
                    style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white'
                    }}
                />
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <GiphyGrid onGifClick={onGifSelect} />
                </div>
            </div>
        </SearchContextManager>
    );
};

export default GiphyPicker;
