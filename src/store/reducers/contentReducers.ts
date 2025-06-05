// src/store/reducers/contentReducers.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem, TrendingContent, SearchFilters, ContentState } from '../../types';

const contentInitialState: ContentState = {
	items: [],
	featuredContent: [],
	trendingContent: [],
	currentContent: null,
	isLoading: false,
	error: null,
	filters: {
		query: '',
		type: '',
		tags: [],
		sortBy: 'newest'
	},
	pagination: {
		currentPage: 1,
		totalPages: 1,
		totalItems: 0
	}
};

const contentSlice = createSlice({
	name: 'content',
	initialState: contentInitialState,
	reducers: {
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setContent: (state, action: PayloadAction<ContentItem[]>) => {
			state.items = action.payload;
		},
		addContent: (state, action: PayloadAction<ContentItem>) => {
			state.items.unshift(action.payload);
		},
		updateContent: (state, action: PayloadAction<ContentItem>) => {
			const index = state.items.findIndex(item => item.id === action.payload.id);
			if (index !== -1) {
				state.items[index] = action.payload;
			}
		},
		deleteContent: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter(item => item.id !== action.payload);
		},
		setFeaturedContent: (state, action: PayloadAction<ContentItem[]>) => {
			state.featuredContent = action.payload;
		},
		setTrendingContent: (state, action: PayloadAction<TrendingContent[]>) => {
			state.trendingContent = action.payload;
		},
		setCurrentContent: (state, action: PayloadAction<ContentItem | null>) => {
			state.currentContent = action.payload;
		},
		likeContent: (state, action: PayloadAction<string>) => {
			const content = state.items.find(item => item.id === action.payload);
			if (content) {
				if (content.isLiked) {
					content.likes -= 1;
					content.isLiked = false;
				} else {
					content.likes += 1;
					content.isLiked = true;
				}
			}
			if (state.currentContent && state.currentContent.id === action.payload) {
				if (state.currentContent.isLiked) {
					state.currentContent.likes -= 1;
					state.currentContent.isLiked = false;
				} else {
					state.currentContent.likes += 1;
					state.currentContent.isLiked = true;
				}
			}
		},
		favoriteContent: (state, action: PayloadAction<string>) => {
			const content = state.items.find(item => item.id === action.payload);
			if (content) {
				content.isFavorited = !content.isFavorited;
			}
			if (state.currentContent && state.currentContent.id === action.payload) {
				state.currentContent.isFavorited = !state.currentContent.isFavorited;
			}
		},
		incrementViews: (state, action: PayloadAction<string>) => {
			const content = state.items.find(item => item.id === action.payload);
			if (content) {
				content.views += 1;
			}
			if (state.currentContent && state.currentContent.id === action.payload) {
				state.currentContent.views += 1;
			}
		},
		setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
			state.filters = { ...state.filters, ...action.payload };
		},
		clearFilters: (state) => {
			state.filters = {
				query: '',
				type: '',
				tags: [],
				sortBy: 'newest'
			};
		},
		setPagination: (state, action: PayloadAction<{
			currentPage: number;
			totalPages: number;
			totalItems: number;
		}>) => {
			state.pagination = action.payload;
		}
	}
});

export const contentActions = contentSlice.actions;
export const contentReducer = contentSlice.reducer;