<script lang="ts">
	import { empty, setSettings } from './store';

	function clearList() {
		empty();
	}
</script>

<button class="btn btn-neutral btn-xs" onclick={clearList}> Clear </button>
<div class="dropdown dropdown-top">
	<button class="btn btn-neutral btn-xs">Filters</button>
	<ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		<li>
			<button
				class="form-control"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: false, Img: false, Other: false },
					})}
			>
				<span class="label-text">All</span>
			</button>
		</li>
		<li>
			<button
				class="form-control"
				onclick={() =>
					setSettings({
						filters: { GQL: true, JSON: false, XML: false, Img: false, Other: false },
					})}
			>
				<span class="label-text">GQL</span>
			</button>
		</li>
		<li>
			<button
				class="form-control"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: true, XML: false, Img: false, Other: false },
					})}
			>
				<span class="label-text">JSON</span>
			</button>
		</li>
		<li>
			<button
				class="form-control"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: true, Img: false, Other: false },
					})}
			>
				<span class="label-text">XML</span>
			</button>
		</li>
		<li>
			<button
				class="form-control"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: false, Img: true, Other: false },
					})}
			>
				<span class="label-text">Img</span>
			</button>
		</li>
		<li>
			<button
				class="form-control"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: false, Img: false, Other: true },
					})}
			>
				<span class="label-text">Other</span>
			</button>
		</li>
	</ul>
</div>
