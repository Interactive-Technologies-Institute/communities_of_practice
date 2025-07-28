import type { Branding, Feature, Notification, UserProfile, Conversation } from '@/types/types';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async ({ locals: { supabase, safeGetSession }, cookies }) => {
	const { session, user } = await safeGetSession();

	let profile: UserProfile | null = null;
	if (user) {
		const { data } = await supabase.from('profiles_view').select().eq('id', user.id).single();
		if (data) {
			profile = {
				...data
			};
			if (profile.avatar) {
				profile.avatar = supabase.storage.from('users').getPublicUrl(profile.avatar).data.publicUrl;
			}
		}
	}

	let notifications: Notification[] = [];
	if (user) {
		const { data } = await supabase
			.from('notifications')
			.select()
			.eq('user_id', user.id)
			.order('inserted_at', { ascending: false });
		if (data) notifications = data;
	}

	let features: Feature[] = [];
	const { data: featuresData } = await supabase
		.from('feature_flags')
		.select('id')
		.eq('enabled', true);
	if (featuresData) features = featuresData.map((f: { id: Feature }) => f.id);

	let conversations: Conversation[] = [];
	if (user) {
		const { data } = await supabase
			.from('conversations')
			.select()
			.eq('user_id', user.id)
			.order('inserted_at', { ascending: true });
		console.log('conversations', data);
		if (data) conversations = data;
	}

	let branding: Branding = {
		name: 'KCIDADE',
		slogan: 'A community for everyone',
		color_theme: 'neutral',
		radius: 0.5,
	};

	const { data: brandingData } = await supabase.from('branding').select().single();
	if (brandingData) branding = brandingData;
	if (branding.logo) {
		branding.logo = supabase.storage.from('branding').getPublicUrl(branding.logo).data.publicUrl;
	}

	return {
		features,
		branding,
		cookies: cookies.getAll(),
		session,
		user,
		profile,
		notifications,
		conversations,
	};
});
