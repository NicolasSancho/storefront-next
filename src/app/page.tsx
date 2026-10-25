import { Container } from "@nicolassancho/storybook-core";
import { CategoryLinks } from "@/components/home/category-links";
import { Hero } from "@/components/home/hero";
import { NewArrivals } from "@/components/home/new-arrivals";

export default function Home() {
  return (
    <Container>
      <Hero />
      <NewArrivals />
      <CategoryLinks />
    </Container>
  );
}
