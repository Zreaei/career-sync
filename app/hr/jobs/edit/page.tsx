"use client";
import React from 'react';

export default function TambahEditLowongan() {
  return (
    <main>

{/*  SideNavBar  */}
<nav className="bg-surface-container-low dark:bg-surface-dim text-primary dark:text-inverse-primary font-label text-sm h-screen w-64 fixed left-0 top-0 flex flex-col py-6 space-y-2 z-50">
<div className="px-6 pb-6">
<h1 className="font-headline text-lg font-bold text-primary">CareerSync</h1>
<p className="text-xs text-on-surface-variant">Academic Portal</p>
</div>
<div className="flex-1 flex flex-col space-y-1">
<a className="flex items-center space-x-3 text-on-surface-variant px-4 py-3 mx-2 hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all rounded-xl" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span>Dashboard</span>
</a>
<a className="flex items-center space-x-3 bg-primary-container text-on-primary-container rounded-xl mx-2 font-bold px-4 py-3 hover:bg-surface-container-high transition-all" href="#">
<span className="material-symbols-outlined" >work</span>
<span>Lowongan</span>
</a>
<a className="flex items-center space-x-3 text-on-surface-variant px-4 py-3 mx-2 hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all rounded-xl" href="#">
<span className="material-symbols-outlined">hub</span>
<span>Networking</span>
</a>
<a className="flex items-center space-x-3 text-on-surface-variant px-4 py-3 mx-2 hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all rounded-xl" href="#">
<span className="material-symbols-outlined">settings_account_box</span>
<span>Account Settings</span>
</a>
</div>
<div className="mt-auto flex flex-col space-y-1 px-2">
<button className="flex items-center justify-center space-x-2 w-full py-2 bg-transparent text-primary hover:bg-surface-container-high transition-all rounded-xl">
<span className="material-symbols-outlined">person</span>
<span>View Profile</span>
</button>
<a className="flex items-center space-x-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all rounded-xl" href="#">
<span className="material-symbols-outlined">help_center</span>
<span>Support</span>
</a>
<a className="flex items-center space-x-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all rounded-xl" href="#">
<span className="material-symbols-outlined">logout</span>
<span>Sign Out</span>
</a>
</div>
</nav>
{/*  Main Content Area  */}
<div className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
{/*  TopAppBar  */}
<header className="bg-surface-container-lowest dark:bg-on-background full-width sticky top-0 z-40 flex justify-between items-center w-full px-6 py-3">
<div className="flex items-center space-x-4">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
<input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64" placeholder="Search..." type="text"/>
</div>
</div>
<div className="flex items-center space-x-4 text-primary dark:text-inverse-primary">
<button className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors rounded-full">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="p-2 hover:bg-surface-container-low dark:hover:bg-surface-variant transition-colors rounded-full">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
{/*  Form Canvas  */}
<main className="flex-1 overflow-y-auto p-8 bg-surface">
<div className="max-w-4xl mx-auto space-y-8 pb-20">
<div className="mb-8">
<h2 className="font-headline text-3xl font-bold text-on-background mb-2">Buat Lowongan Baru</h2>
<p className="text-on-surface-variant">Lengkapi informasi di bawah ini untuk mempublikasikan peluang karir baru.</p>
</div>
<form className="space-y-8">
{/*  Section 1: Informasi Dasar  */}
<section className="bg-surface-container-lowest p-8 rounded-xl">
<h3 className="font-headline text-xl font-bold text-on-background mb-6">Informasi Dasar</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="col-span-1 md:col-span-2">
<label className="block font-label text-sm font-semibold text-on-surface mb-2">Judul Pekerjaan</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 text-on-background" placeholder="mis. Data Analyst Intern" type="text"/>
</div>
<div>
<label className="block font-label text-sm font-semibold text-on-surface mb-2">Departemen</label>
<select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 text-on-background">
<option>Pilih Departemen</option>
<option>Engineering</option>
<option>Marketing</option>
<option>Design</option>
</select>
</div>
<div>
<label className="block font-label text-sm font-semibold text-on-surface mb-2">Tipe Pekerjaan</label>
<select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 text-on-background">
<option>Penuh Waktu</option>
<option>Paruh Waktu</option>
<option>Magang</option>
</select>
</div>
<div className="col-span-1 md:col-span-2">
<label className="block font-label text-sm font-semibold text-on-surface mb-2">Lokasi</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 text-on-background" placeholder="mis. Jakarta Pusat, atau Remote" type="text"/>
</div>
</div>
</section>
{/*  Section 2: Kualifikasi with AI  */}
<section className="bg-surface-container-lowest p-8 rounded-xl relative">
<div className="flex justify-between items-center mb-6">
<h3 className="font-headline text-xl font-bold text-on-background">Kualifikasi</h3>
<button className="flex items-center space-x-2 text-primary hover:bg-primary-container hover:text-on-primary-container px-3 py-1.5 rounded-lg transition-colors text-sm font-semibold" type="button">
<span className="material-symbols-outlined text-sm">auto_awesome</span>
<span>Ekstrak dari Draft</span>
</button>
</div>
<div className="space-y-4">
<textarea className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 text-on-background" placeholder="Masukkan kualifikasi yang dibutuhkan..." rows={4}></textarea>
<p className="text-xs text-on-surface-variant flex items-center"><span className="material-symbols-outlined text-xs mr-1">info</span> Gunakan tombol AI di atas untuk mengekstrak kualifikasi dari dokumen yang diunggah.</p>
</div>
</section>
{/*  Section 3: Rich Text Editor (Mock)  */}
<section className="bg-surface-container-lowest p-8 rounded-xl">
<h3 className="font-headline text-xl font-bold text-on-background mb-6">Deskripsi Pekerjaan</h3>
<div className="border border-outline-variant rounded-lg overflow-hidden">
{/*  Toolbar Mock  */}
<div className="bg-surface-container-low border-b border-outline-variant px-4 py-2 flex items-center space-x-2">
<button className="p-1 hover:bg-surface-variant rounded text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_bold</span></button>
<button className="p-1 hover:bg-surface-variant rounded text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_italic</span></button>
<button className="p-1 hover:bg-surface-variant rounded text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_underlined</span></button>
<div className="w-px h-4 bg-outline-variant mx-2"></div>
<button className="p-1 hover:bg-surface-variant rounded text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
<button className="p-1 hover:bg-surface-variant rounded text-on-surface-variant" type="button"><span className="material-symbols-outlined text-sm">format_list_numbered</span></button>
</div>
{/*  Editor Area  */}
<textarea className="w-full bg-surface-container-lowest border-0 focus:ring-0 p-4 text-on-background resize-y" placeholder="Jelaskan peran, tanggung jawab, dan ekspektasi..." rows={8}></textarea>
</div>
</section>
{/*  Section 4: Actions  */}
<div className="flex justify-end space-x-4 pt-6">
<button className="px-6 py-2 border border-outline text-on-surface hover:bg-surface-variant rounded-full font-label font-semibold transition-colors" type="button">
                            Preview
                        </button>
<button className="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-label font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2" type="submit">
<span className="material-symbols-outlined text-sm">publish</span>
<span>Publish Lowongan</span>
</button>
</div>
</form>
</div>
</main>
</div>

    </main>
  );
}
