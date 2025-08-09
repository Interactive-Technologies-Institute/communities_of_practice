<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { downloadContentSchema, type  DownloadContentSchema} from '@/schemas/content';
	import { cn } from '@/utils';
	import { Download } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
    import { page } from '$app/stores';

	export let data: SuperValidated<Infer<DownloadContentSchema>>;

	const form = superForm(data, {
		validators: zodClient(downloadContentSchema),
		invalidateAll: 'force',
	});

	const { form: formData, enhance, submit } = form;

    const filePath = $formData.file;

    async function handleDownload() {
		const { data:fileBlob, error } = await $page.data.supabase.storage.from('contents').download(filePath);

		if (error) {
			console.error('Download failed:', error.message);
			alert('Could not download file.');
			return;
		}
		const url = URL.createObjectURL(fileBlob);
		const a = Object.assign(document.createElement('a'), {
			href: url,
			download: filePath
		});
		a.click();
		URL.revokeObjectURL(url);
		$formData.value = true;
		await tick();
		submit();
	}
</script>

<form method="POST" action="?/downloadContent" use:enhance>
	<input type="hidden" name="value" value={$formData.value} />
	<input type="hidden" name="file"  value={$formData.file} />
	<Button type="button" 
		on:click={handleDownload}
		variant="ghost"
		size="sm"
		class="flex items-center gap-2 text-orange-500"
	>
		<Download class="h-4 w-4" />
		Download
	</Button>
</form>
