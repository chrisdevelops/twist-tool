<script>
    import { P, Card, Radio, AccordionItem, Accordion, Heading, Input, Label, Textarea, Button, Helper, Spinner, Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell } from 'flowbite-svelte';

    export let form
    let isLoading = false
    let selectedResponseFormat = "country"

    function toggleLoadState() {
		isLoading = true;
	}

    function isFieldError() {
        return form && !form.success ? "red" : "gray"
    }

    function isTextareaError() {
        return form && !form.success ? "!text-red-500 border !border-red-400 focus !focus-red-400" : ""
    }
</script>

<div class="max-w-screen-lg mx-auto p-4">
    <Heading class="my-8 print:hidden" tag="h1">Twist Tool</Heading>
    

    <!-- LOGIC: Show form if form has not been successfully submitted -->
    {#if !form?.success}

        <Card size="xl">
            <form method="POST" on:submit={toggleLoadState}>

                <!-- SECTION: Request Token -->
                <div class="mb-6">
                    <Label for="access_token" class="mb-2" color={isFieldError()}>Request Token</Label>
                    <Textarea class={isTextareaError()} id="access_token" name="access_token" placeholder="" rows="8" />
                    {#if form?.error && form?.error.field === "access_token"}
                        <Helper class="text-sm" color="red">{form?.error.message}</Helper>
                    {/if}
                </div>
                
                <!-- SECTION: Package IDs -->
                <div class="mb-6">
                    <Label for="package_ids" class="mb-2" color="gray">Package IDs</Label>
                    <Input type="text" id="package_ids" name="package_ids" placeholder="" />
                    <Helper class="text-sm"></Helper>
                </div>
                
                <!-- SECTION: Country Codes -->
                <div class="mb-6">
                    <Label for="country_codes" class="mb-2">Country Codes</Label>
                    <Input type="text" id="country_codes" name="country_codes" placeholder="" />
                    <Helper class="text-sm"></Helper>
                </div>
        
                <!-- SECTION: Additional Options -->
                <Accordion class="mb-6" flush>
                    <AccordionItem>
                        <span slot="header">Addition Options</span>
        
                        <!-- SECTION: Response Format -->
                        <div>
                            <Label class="mb-2">Response Format</Label>
                            <ul class="space-y-2">
                                <li><Radio name="response_format" value="country" bind:group={selectedResponseFormat}>List by Country</Radio></li>
                                <li><Radio name="response_format" value="field" bind:group={selectedResponseFormat}>List by Field</Radio></li>
                            </ul>
                        </div>
                    </AccordionItem>
                </Accordion>
                
                <!-- SECTION: Submit Button -->
                <div>
                    <Button type="submit">
                        {#if isLoading}
                            <Spinner class="me-3" size="4" color="white" /> Processing...
                        {:else}
                            Submit
                        {/if}
                    </Button>
                </div>

            </form>
        </Card>

    {:else if form?.success && form?.format === 'country'}
        
        <section>
            <Heading class="mb-8 print:hidden" tag="h2">Results</Heading>

            {#if form.data.length > 1}

                <Accordion>
                    {#each form.data as current_package}
                        
                            <AccordionItem tag="h4">
                                <span slot="header">{current_package.name}</span>

                                <Table shadow>

                                    <caption class="p-4 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                                        <P class="text-sm font-normal text-gray-500 dark:text-gray-400">{current_package.id}</P>
                                    </caption>

                                    <TableHead>
                                        <TableHeadCell>Country</TableHeadCell>
                                        <TableHeadCell>Fields</TableHeadCell>
                                    </TableHead>

                                    <TableBody>
                                        {#each current_package.countryList as current_country}
                                            <TableBodyRow>
                                                <TableBodyCell>{current_country.code}</TableBodyCell>
                                                <TableBodyCell>
                                                    {#each current_country.requiredFields as current_field, index}
                                                        {current_field}{#if (index + 1) < current_country.requiredFields.length},&nbsp;{/if}
                                                    {/each}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                        {/each}
                                    </TableBody>

                                </Table>

                            </AccordionItem>
                        
                    {/each}
                </Accordion>

            {:else}

                <Table shadow>

                    <caption class="p-4 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                        <Heading class="mb-0" tag="h4">{form.data[0].name}</Heading>
                        <P class="text-sm font-normal text-gray-500 dark:text-gray-400">{form.data[0].id}</P>
                    </caption>

                    <TableHead>
                        <TableHeadCell>Country</TableHeadCell>
                        <TableHeadCell>Fields</TableHeadCell>
                    </TableHead>

                    <TableBody tableBodyClass="divide-y">
                        {#each form.data[0].countryList as current_country}
                            <TableBodyRow>
                                <TableBodyCell>{current_country.code}</TableBodyCell>
                                <TableBodyCell>
                                    {#each current_country.requiredFields as current_field, index}
                                        {current_field}{#if (index + 1) < current_country.requiredFields.length},&nbsp;{/if}
                                    {/each}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>

                </Table>

            {/if}

        </section>

    {:else if form?.success && form?.format === 'field'}

        <section>
            <Heading class="mb-8 print:hidden" tag="h2">Results</Heading>

            {#if form.data.length > 1}

                <Accordion>
                    {#each form.data as current_package}
                        
                            <AccordionItem tag="h4">
                                <span slot="header">{current_package.name}</span>

                                <Table shadow>

                                    <caption class="p-4 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 !print:text-gray-900 !print:bg-white">
                                        <P class="text-sm font-normal text-gray-500 dark:text-gray-400 print:text-gray-700">{current_package.id}</P>
                                    </caption>
                
                                    <TableHead class="!print:text-gray-900">
                                        <TableHeadCell>Field</TableHeadCell>
                                        <TableHeadCell>Countries</TableHeadCell>
                                    </TableHead>
                
                                    <TableBody tableBodyClass="divide-y !print:text-gray-900">
                                        {#each current_package.fields as current_field}
                                            <TableBodyRow>
                                                <TableBodyCell>{Object.keys(current_field)}</TableBodyCell>
                                                <TableBodyCell>
                                                    {#each Object.entries(current_field).toString().split(',').slice(1) as current_country, index}
                                                        {current_country}{#if (index + 1) < Object.entries(current_field).toString().split(',').slice(1).length},&nbsp;{/if}
                                                    {/each}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                        {/each}
                                    </TableBody>
                                    
                                </Table>

                            </AccordionItem>
                        
                    {/each}
                </Accordion>

            {:else}

                <Table shadow>

                    <caption class="p-4 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 !print:text-gray-900 !print:bg-white">
                        <Heading class="mb-0 !print:text-gray-900" tag="h4">{form.data[0].name}</Heading>
                        <P class="text-sm font-normal text-gray-500 dark:text-gray-400 print:text-gray-700">{form.data[0].id}</P>
                    </caption>

                    <TableHead class="!print:text-gray-900">
                        <TableHeadCell>Field</TableHeadCell>
                        <TableHeadCell>Countries</TableHeadCell>
                    </TableHead>

                    <TableBody tableBodyClass="divide-y !print:text-gray-900">
                        {#each form.data[0].fields as current_field}
                            <TableBodyRow>
                                <TableBodyCell>{Object.keys(current_field)}</TableBodyCell>
                                <TableBodyCell>
                                    {#each Object.entries(current_field).toString().split(',').slice(1) as current_country, index}
                                        {current_country}{#if (index + 1) < Object.entries(current_field).toString().split(',').slice(1).length},&nbsp;{/if}
                                    {/each}
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                    
                </Table>

            {/if}

        </section>

    {/if}
</div>


