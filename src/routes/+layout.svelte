<script>
	import '../app.css';
    import Navbar from "../lib/components/navbar.svelte";

    const links = [
        { url: '/', title: 'Twist Tool' }
    ]
</script>

<Navbar title="PIE Labs" links={links} />

<main>
	<slot />
</main>