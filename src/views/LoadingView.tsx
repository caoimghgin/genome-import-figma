import { h } from "preact";
import { Container, Text, VerticalSpace, LoadingIndicator, MiddleAlign } from "@create-figma-plugin/ui";

export const LoadingView = () => {
    return (
        <Container space='medium'>
            <MiddleAlign>
                <LoadingIndicator />
                <VerticalSpace space='small' />
                <Text>Loading...</Text>
            </MiddleAlign>
        </Container>
    )
}