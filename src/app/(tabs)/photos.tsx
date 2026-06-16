/**
 * Purpose: Photos tab — album grid, photo upload, and viewer.
 * Inputs:  auth state
 * Outputs: PhotosScreen with album grid; tapping album navigates to photo list
 * Constraints: Uses 7-state screen. Multi-select upload. Offline-queued uploads.
 * SPORT: MASTER-ROUTES.md
 */

import React from 'react';
import { PhotosScreen } from '../../screens/PhotosScreen';

export default function PhotosTabScreen(): React.ReactElement {
  return <PhotosScreen />;
}
