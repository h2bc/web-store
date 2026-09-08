import Heading from '@/components/layout/heading'

export const metadata = {
  title: 'About',
  description: 'About h2bc',
}

export default function AboutPage() {
  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-4xl flex flex-col">
        <Heading level={1} font="blackletter" className="mb-8">
          Where it all began
        </Heading>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere,
          nibh id pulvinar euismod, justo purus viverra mauris, vel ultricies
          arcu massa eget urna. Integer vitae nibh sit amet nisl accumsan
          fermentum. Suspendisse non dictum erat. Donec finibus, neque at
          dignissim luctus, turpis sapien fermentum odio, sed facilisis felis
          nisl sit amet enim.
        </p>
        <p className="mb-4">
          Curabitur ante neque, consequat a risus vitae, tincidunt faucibus
          erat. Donec aliquet, tortor sed tristique hendrerit, metus velit
          fringilla dolor, vitae maximus nunc nunc non nibh. Vestibulum ante
          ipsum primis in faucibus orci luctus et ultrices posuere cubilia
          curae; Nulla laoreet, eros non eleifend aliquet, justo lacus vulputate
          enim, at tincidunt justo nisl a dui.
        </p>
        <p className="mb-4">
          Praesent ac nunc id libero facilisis tempus. Fusce et ligula sed arcu
          tincidunt pellentesque vitae at est. Aliquam commodo orci sed erat
          tempus, quis aliquet ipsum rhoncus. Etiam dictum volutpat nisl sed
          pellentesque. Pellentesque lobortis, nisl id varius tincidunt, velit
          lorem gravida lectus, vitae bibendum sapien metus vitae nunc.
        </p>
        <p className="mb-8">
          Aenean dictum neque vitae turpis hendrerit, at ullamcorper magna
          pulvinar. Quisque rutrum arcu sed lacus suscipit, eu viverra ante
          porttitor. Integer maximus sapien ut neque convallis, vitae facilisis
          lacus luctus. Sed quis suscipit elit. Integer pharetra lacus nec lorem
          gravida, sit amet aliquet arcu commodo.
        </p>
      </div>
    </div>
  )
}
