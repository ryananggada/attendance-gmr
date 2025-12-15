import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-lg text-center font-semibold">
        Selamat datang, {user?.fullName}!
      </h2>
    </div>
  );
}
