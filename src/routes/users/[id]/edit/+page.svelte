<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import PasswordForm from './_components/password-form.svelte';
	import ProfileForm from './_components/profile-form.svelte';

	export let data;
</script>

<MetaTags
	title="Edita Perfil de Utilizador"
	description="Edita o teu perfil de utilizador, incluindo a palavra-passe, avatar e informações pessoais"
/>

<PageHeader
	title="Edita Perfil de Utilizador"
	subtitle="Edita o teu perfil de utilizador, incluindo a palavra-passe, avatar e informações pessoais"
/>
<div class="container mb-20 flex flex-col gap-y-8 md:gap-y-10">
	<ProfileForm data={data.updateProfile} />
	<PasswordForm data={data.updatePassword} />
</div>
