<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import { Button, buttonVariants } from '@/components/ui/button';
	import { Calendar } from '@/components/ui/calendar';
	import * as Card from '@/components/ui/card';
	import { FileInput } from '@/components/ui/file-input';
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import * as Popover from '@/components/ui/popover';
	import { TagInput } from '@/components/ui/tag-input';
	import { Textarea } from '@/components/ui/textarea';
	import { editEventSchema, type EditEventSchema } from '@/schemas/event';
	import { cn } from '@/utils';
	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		type DateValue,
	} from '@internationalized/date';
	import { CalendarIcon, Loader2 } from 'lucide-svelte';
	import { fileProxy, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';
	import { OpenAI } from 'openai';

	export let data: SuperValidated<Infer<EditEventSchema>>;
	export let eventId: number;
	export let showAnnexesButton: boolean = false;

	const form = superForm(data, {
		validators: zodClient(editEventSchema),
		taintedMessage: true,
		dataType: 'json'
	});

	const { form: formData, enhance, submitting, errors } = form;

	const openai = new OpenAI({ apiKey: PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true});

	const df = new DateFormatter('en-US', {
		dateStyle: 'long',
	});
	
	let date: DateValue | undefined;
	$: date = $formData.date ? parseDate($formData.date) : undefined;

	let votingParsedEndDate: DateValue | undefined;
	$: votingParsedEndDate = $formData.voting_end_date ? parseDate($formData.voting_end_date) : undefined;

	const image = fileProxy(form, 'image');
	let imageUrl: string | null | undefined = $formData.imageUrl;
	$: {
		if ($image.length > 0) {
			const img = $image.item(0);
			const reader = new FileReader();
			reader.onload = (e) => {
				imageUrl = e.target?.result as string | null | undefined;
			};
			reader.readAsDataURL(img!);
		} else {
			imageUrl = $formData.imageUrl;
		}
	}

	// Initial values to use in case of submitting the form
	// with a deadline that has passed
	let initialDate = $formData.date;
	let initialStartTime = $formData.start_time;
	let initialEndTime = $formData.end_time;

	// When voting is allowed
	$: if ($formData.allow_voting && $formData.voting_end_date && $formData.voting_end_time) {
		const deadline = new Date(`${$formData.voting_end_date}T${$formData.voting_end_time}`);
		if (deadline > new Date()) {
			// Reset date and times if voting deadline is in the future
				$formData.date = null;
				$formData.start_time = null;
				$formData.end_time = null;
		} else{
			// Keep date and times if voting deadline has passed and allow_voting is true
			$formData.date = initialDate;
			$formData.start_time = initialStartTime;
			$formData.end_time = initialEndTime;
		}
	}

	let backupDate: string | null | undefined = initialDate;
	let backupStartTime: string | null | undefined = initialStartTime;
	let backupEndTime: string | null | undefined = initialEndTime;

	let backupVotingOptions = $formData.voting_options;
	let backupVotingEndDate: string | null | undefined = null;
	let backupVotingEndTime: string | null | undefined = null;

	function switchToVoting() {
		// Backup fixed-date fields
		backupDate = $formData.date;
		backupStartTime = $formData.start_time;
		backupEndTime = $formData.end_time;

		// Restore voting fields
		$formData.allow_voting = true;
		$formData.date = initialDate;
		$formData.start_time = initialStartTime;
		$formData.end_time = initialEndTime;
		$formData.voting_options = backupVotingOptions;
		$formData.voting_end_date = backupVotingEndDate;
		$formData.voting_end_time = backupVotingEndTime;
	}

	function switchToFixed() {
		// Backup voting fields
		backupVotingOptions = $formData.voting_options;
		backupVotingEndDate = $formData.voting_end_date;
		backupVotingEndTime = $formData.voting_end_time;

		// Restore fixed-date fields
		$formData.allow_voting = false;
		$formData.voting_options = [];
		$formData.voting_end_date = null;
		$formData.voting_end_time = null;
		$formData.date = backupDate;
		$formData.start_time = backupStartTime;
		$formData.end_time = backupEndTime;
	}

	async function transcribe(audioFile: File): Promise<string | null> {
		try {
			const transcription = await openai.audio.transcriptions.create({
				file: audioFile,
				model: 'whisper-1',
				response_format: 'text',
			});
			return transcription;

		} catch (error) {
			console.log('Error generating transcription', error);
			return null;
		}
	}

	function extractDriveFileId(url: string): string | null {
		const match = url.match(/\/file\/d\/([^/]+)\//);
		return match ? match[1] : null;
	}

	async function getBlobFromGoogleDriveLink(driveLink: string): Promise<Blob> {
		const fileId = extractDriveFileId(driveLink);
		if (!fileId) throw new Error('Invalid Google Drive link');
		const proxyUrl = `/api/gdrive-audio?id=${fileId}`;
		const response = await fetch(proxyUrl);
		if (!response.ok) throw new Error('Failed to fetch from server');
		const blob = await response.blob();
		return blob;
	}

	function isGoogleDriveLink(link: string) {
		return /drive\.google\.com\/file\/d\//.test(link);
	}

	async function generateTranscription(recordingLink: string): Promise<string | null> {
		try {
			let blob: Blob;

			if (isGoogleDriveLink(recordingLink)) {
				blob = await getBlobFromGoogleDriveLink(recordingLink);
			} else {
				const res = await fetch(recordingLink);
				if (!res.ok) throw new Error('Failed to fetch file from URL');
				blob = await res.blob();
			}

			console.log('Blob type:', blob.type, 'size:', blob.size);

			if (!blob.type.startsWith('audio/') && !blob.type.startsWith('video/')) {
				throw new Error(`Invalid media type for transcription: ${blob.type}`);
			}

			const file = new File([blob], 'drive_audio.mp3', { type: 'audio/mpeg' });

			const result = await transcribe(file);
			return result ?? null;

		} catch (error) {
			console.error('Transcription failed:', error);
			return null;
		}
	}

	async function generateSummary(content: string): Promise<string | null> {
		try {
			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are an assistant that summarizes events / meetings based on their transcription on a platform for communities of practice clearly and concisely. Divide the topics talked about into points if possible.'
					},
					{
						role: 'user',
						content: `Summarize the following event:\n\n${content}`
					}
				],
				temperature: 0.7,
				max_tokens: 400
			});

			return response.choices[0]?.message?.content?.trim() ?? null;

		} catch (error) {
			console.error('Error generating summary:', error);
			return null;
		}
	}

	let loadingTranscription = false;
	let loadingSummary = false;

	async function handleGenerateTranscription() {
		loadingTranscription = true;

		if ($formData.recording_link) {
			const transcription = await generateTranscription($formData.recording_link);
			$formData.transcription = transcription ?? '';
			console.log('Transcription result:', transcription);
		} else {
			console.warn('No recording link provided for transcription.');
		}

		loadingTranscription = false;
	}

	async function handleGenerateSummary() {
		loadingSummary = true;

		const content = `Title: ${$formData.title} Description: ${$formData.description} Transcription: ${$formData.transcription}`;

		const summary = await generateSummary(content);

		if (summary) {
			$formData = {
				...$formData,
				summary
			};
		}

		loadingSummary = false;
	}

</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="flex flex-col gap-y-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>Information</Card.Title>
			<Card.Description>Add details to this event</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="title">
				<Form.Control let:attrs>
					<Form.Label>Title*</Form.Label>
					<Input {...attrs} bind:value={$formData.title} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control let:attrs>
					<Form.Label>Description*</Form.Label>
					<Textarea {...attrs} bind:value={$formData.description} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="tags">
				<Form.Control let:attrs>
					<Form.Label>Tags*</Form.Label>
					<TagInput {...attrs} bind:value={$formData.tags} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="location">
				<Form.Control let:attrs>
					<Form.Label>Location*</Form.Label>
					<Input {...attrs} bind:value={$formData.location} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="recording_link">
				<Form.Control let:attrs>
					<Form.Label>Video/Audio Recording Link (Google Drive Share Link Only)</Form.Label>
					<Input {...attrs} bind:value={$formData.recording_link} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="transcription">
				<Form.Control let:attrs>
					<Form.Label class="flex justify-between items-center">
						Video/Audio Transcription
						<Button
							type="button"
							size="sm"
							on:click={handleGenerateTranscription}
							disabled={loadingTranscription}
						>
							{#if loadingTranscription}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								Generate Transcription
							{/if}
						</Button>
					</Form.Label>
					<Textarea {...attrs} class="w-full rounded border px-3 py-2 text-sm max-h-48 overflow-auto" bind:value={$formData.transcription} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="summary">
				<Form.Control let:attrs>
					<Form.Label class="flex justify-between items-center">
						Summary
						<Button
							type="button"
							size="sm"
							on:click={handleGenerateSummary}
							disabled={loadingSummary}
						>
							{#if loadingSummary}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								Generate Summary
							{/if}
						</Button>
					</Form.Label>
					<Textarea {...attrs} class="w-full rounded border px-3 py-2 text-sm max-h-48 overflow-auto" bind:value={$formData.summary} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="allow_voting">
				<Form.Control let:attrs>
					<Form.Label>Allow Schedule Voting?</Form.Label>
					<div class="flex items-center gap-4">
						<label class="flex items-center gap-1">
							<input
								type="radio"
								name="allow_voting"
								value="true"
								checked={$formData.allow_voting === true}
								on:change={() => {switchToVoting();}}
							/>
							<span>Yes</span>
						</label>
						<label class="flex items-center gap-1">
							<input
								type="radio"
								name="allow_voting"
								value="false"
								checked={$formData.allow_voting === false}
								on:change={() => {switchToFixed();}}
							/>
							<span>No</span>
						</label>
					</div>
				</Form.Control>
			</Form.Field>
			{#if !$formData.allow_voting}
				<div class="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3">
					<Form.Field {form} name="date">
						<Form.Control id="date" let:attrs>
							<Form.Label for="date">Date*</Form.Label>
							<Popover.Root>
								<Popover.Trigger
									{...attrs}
									class={cn(
										buttonVariants({ variant: 'outline' }),
										'w-full justify-start pl-4 text-left font-normal',
										!date && 'text-muted-foreground'
									)}
								>
									{date ? df.format(date.toDate(getLocalTimeZone())) : 'Pick a date'}
									<CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" side="top">
									<Calendar
										initialFocus
										value={date}
										onValueChange={(v) => {
											$formData.date = v?.toString() ?? '';
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							<input hidden value={$formData.date} name={attrs.name} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="start_time">
						<Form.Control let:attrs>
							<Form.Label>Start Time*</Form.Label>
							<Input type="time" step="60" {...attrs} bind:value={$formData.start_time} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="end_time">
						<Form.Control let:attrs>
							<Form.Label>End Time*</Form.Label>
							<Input type="time" step="60" {...attrs} bind:value={$formData.end_time} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
					<Form.Field {form} name="voting_end_date">
						<Form.Control id="voting_end_date" let:attrs>
							<Form.Label for="voting_end_date">Voting Deadline Date*</Form.Label>
							<Popover.Root>
								<Popover.Trigger
									{...attrs}
									class={cn(
										buttonVariants({ variant: 'outline' }),
										'w-full justify-start pl-4 text-left font-normal',
										!votingParsedEndDate && 'text-muted-foreground'
									)}
								>
									{votingParsedEndDate
										? df.format(votingParsedEndDate.toDate(getLocalTimeZone()))
										: 'Pick a date'}
									<CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" side="top">
									<Calendar
										initialFocus
										value={votingParsedEndDate}
										onValueChange={(v) => {
											$formData.voting_end_date = v?.toString() ?? '';
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							<input hidden value={$formData.voting_end_date} name={attrs.name} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="voting_end_time">
						<Form.Control let:attrs>
							<Form.Label>Voting Deadline Time*</Form.Label>
							<Input type="time" step="60" {...attrs} bind:value={$formData.voting_end_time} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
				</div>
                {#if $formData.voting_options}
                    <Form.Field {form} name="voting_options">
                        <Form.Control let:attrs>
                            <Form.Label class="text-lg font-semibold">Voting Options*</Form.Label>
                            <Form.FieldErrors />
                        </Form.Control>
                    </Form.Field>
                    {#each $formData.voting_options as option, i (i)}
                        <div class="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-3 px-4 py-3 border rounded bg-muted/20">
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Date</p>
                                <p>{df.format(parseDate(option.date).toDate(getLocalTimeZone()))}</p>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">Start Time</p>
                                <p>{option.start_time?.slice(0, 5)}</p>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-muted-foreground">End Time</p>
                                <p>{option.end_time?.slice(0, 5)}</p>
                            </div>
                        </div>
                    {/each}
                {/if}
			{/if}
			<div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
				<Form.Field {form} name="image">
					<Form.Control let:attrs>
						<Form.Label>Cover Image*</Form.Label>
						<Card.Root class="aspect-[3/2] overflow-hidden">
							{#if imageUrl}
								<InteractableImage
									src={imageUrl}
									alt="Event Cover"
									class="h-full w-full object-cover"
								/>
							{/if}
						</Card.Root>
						<FileInput {...attrs} bind:files={$image} accept="image/*" />
						<input hidden value={$formData.imageUrl} name="imageUrl" />
						<Form.FieldErrors />
					</Form.Control>
				</Form.Field>
			</div>
		</Card.Content>
	</Card.Root>
	<div
		class="sticky bottom-0 flex w-full flex-row items-center justify-center gap-x-10 border-t bg-background/95 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>   
    <pre class="text-xs text-red-500">{JSON.stringify($errors, null, 2)}</pre>


		<Button variant="outline" href="/events">Cancel</Button>
		{#if showAnnexesButton}
			<Button variant="outline" href={`/events/${eventId}/annexes`} target="_blank" rel="noopener noreferrer">
				Annexes
			</Button>
		{/if}
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
			<Loader2 class="h-4 w-4 animate-spin" />
			{/if}
			Submit
		</Button>
	</div>
</form>