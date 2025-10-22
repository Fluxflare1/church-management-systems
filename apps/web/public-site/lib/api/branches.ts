export async function getBranchHierarchy() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/branches/hierarchy/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch branch hierarchy');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
