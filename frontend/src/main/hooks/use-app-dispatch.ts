import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store/main.store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
