import { useSelector } from 'react-redux';

import { mapDefaultStoreComparatorValue } from '../mappers/default-store-comparator-value.mapper.ts';
import { RootState } from '../store/main.store';

type Selector<T> = (state: RootState) => T;
type ComparatorFn<T> = (a: T, b: T) => boolean;

const useDefaultSelector = useSelector.withTypes<RootState>();

export const useAppSelector = <T>(
  selector: Selector<T>,
  comparatorFn: ComparatorFn<T> = mapDefaultStoreComparatorValue,
): T => useDefaultSelector(selector, comparatorFn);
