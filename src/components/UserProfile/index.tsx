import Card from '@app/components/Common/Card';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import ProfileHeader from '@app/components/UserProfile/ProfileHeader';
import { useUser } from '@app/hooks/useUser';
import Error from '@app/pages/_error';
import { useRouter } from 'next/router';

const UserProfile = () => {
  const router = useRouter();
  const { user, error } = useUser({
    id: Number(router.query.userId),
  });

  if (!user && !error) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Error statusCode={404} />;
  }

  return (
    <Card className="p-6">
      <PageTitle title={user.displayName} />
      <ProfileHeader user={user} />
    </Card>
  );
};

export default UserProfile;
