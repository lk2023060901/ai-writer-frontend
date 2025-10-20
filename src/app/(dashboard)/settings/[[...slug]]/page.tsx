import SettingsPage from '@/features/settings/components/SettingsPage';

interface SettingsRouteProps {
  params: {
    slug?: string[];
  };
}

const SettingsRoute = ({ params }: SettingsRouteProps) => {
  const initialSlug = params.slug?.[0];
  return <SettingsPage initialSlug={initialSlug} />;
};

export default SettingsRoute;
