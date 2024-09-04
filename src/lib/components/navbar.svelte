<script>
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
    import { page } from '$app/stores';  

    export let title
    export let links
</script>

<Navbar class="print:hidden" let:hidden let:toggle>
	<NavBrand href="/">
		<img
			src="https://flowbite.com/docs/images/logo.svg"
			class="mr-3 h-6 sm:h-9"
			alt="Flowbite Logo"
		/>
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
			{title}
		</span>
	</NavBrand>
	<NavHamburger on:click={toggle} />
	<NavUl {hidden}>
        {#each links as link}
            <NavLi href={link.url} active={$page.url.pathname === link.url ? true : false}>{link.title}</NavLi>
        {/each}
	</NavUl>
</Navbar>