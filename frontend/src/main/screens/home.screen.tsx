import { selectCurrentUser } from '../../user-management/selectors/user-authentication-status.selector';
import { useAppSelector } from '../hooks/use-app-selector';

export const HomeScreen = () => {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Home Screen</h1>
          {user && <p className="text-xl text-gray-700">Welcome, {user.name}!</p>}
        </div>
      </div>
    </div>
  );
};
