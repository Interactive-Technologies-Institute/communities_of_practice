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

	export let data: SuperValidated<Infer<EditEventSchema>>;

	const form = superForm(data, {
		validators: zodClient(editEventSchema),
		taintedMessage: true,
		dataType: 'json'
	});

	const { form: formData, enhance, submitting, errors } = form;

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
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Submit
		</Button>
	</div>
</form>
